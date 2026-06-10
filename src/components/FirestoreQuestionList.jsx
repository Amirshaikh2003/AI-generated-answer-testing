import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ref, get } from "firebase/database";
import { db, rtdb, rtdbError } from "../firebase";
import EditableAnswerRenderer from "./editor/EditableAnswerRenderer";

export default function FirestoreQuestionList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Testing questions here");
      console.log("Firebase project ID:", db.app.options.projectId);

      const querySnapshot = await getDocs(collection(db, "questions"));

      if (querySnapshot.empty) {
        setError(
          "No documents found in 'questions' collection. Please add documents with a 'question' or 'question_text' field."
        );
        return;
      }

      const fetchedQuestions = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();

        const questionText =
          data.question ||
          data.question_text ||
          data.text ||
          data.title ||
          "";

        if (!questionText) {
          console.warn("Document missing question field:", docSnap.id, data);
          return;
        }

        fetchedQuestions.push({
          id: docSnap.id,
          question: questionText,
          answerId:
            data.answer_id ||
            data.answerId ||
            data.firebase_doc_id ||
            data.answer_key ||
            docSnap.id,
          raw: data,
        });
      });

      console.log("Fetched questions:", fetchedQuestions);
      setQuestions(fetchedQuestions);
    } catch (err) {
      console.error("Error fetching questions from Firestore:", err);
      setError(buildFirestoreError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = async (questionItem) => {
    if (!rtdb) {
      setAnswerError(
        `Realtime Database is not available: ${
          rtdbError?.message || "Service not enabled"
        }`
      );
      return;
    }

    setSelectedQuestion(questionItem);
    setSelectedAnswer(null);
    setAnswerLoading(true);
    setAnswerError(null);

    const answerId = questionItem.answerId;

    try {
      console.log("Selected question:", questionItem.question);
      console.log("Fetching answer ID:", answerId);
      console.log("RTDB path:", `answers/${answerId}`);

      const answerRef = ref(rtdb, `answers/${answerId}`);
      const snapshot = await get(answerRef);

      if (!snapshot.exists()) {
        setAnswerError(
          `No answer found in Realtime Database at path: answers/${answerId}\n\n` +
            `Fix: If Firestore document ID and Realtime Database answer key are different, add answer_id field in the Firestore question document.`
        );
        setSelectedAnswer(null);
        return;
      }

      const answerData = snapshot.val();

      const processedAnswerData = normalizeStoredAnswer(
        answerData,
        questionItem.question
      );

      console.log("Raw answer data:", answerData);
      console.log("Processed answer data:", processedAnswerData);
      console.log("Final blocks:", processedAnswerData?.answer?.answer);

      setSelectedAnswer(processedAnswerData);
    } catch (err) {
      console.error("Error fetching answer from Realtime Database:", err);
      setAnswerError(`Failed to load answer: ${err.message}`);
      setSelectedAnswer(null);
    } finally {
      setAnswerLoading(false);
    }
  };

  const goBack = () => {
    setSelectedAnswer(null);
    setSelectedQuestion(null);
    setAnswerError(null);
    setAnswerLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading 
     from Firestore...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>⚠️ Firestore Error</h2>
        <pre>{error}</pre>
      </div>
    );
  }

  return (
    <div className="firestore-question-list">
      {selectedQuestion ? (
        <div>
          <div className="connection-status">
            <span>
              ✅ Connected to Firebase Project: {db.app.options.projectId}
            </span>

            <button className="back-btn" onClick={goBack}>
              ← Back to Questions
            </button>
          </div>

          {answerLoading ? (
            <div className="loading">Loading answer...</div>
          ) : answerError ? (
            <div className="error">
              <h2>⚠️ Answer Load Error</h2>
              <pre>{answerError}</pre>
            </div>
          ) : selectedAnswer ? (
            <EditableAnswerRenderer
            data={selectedAnswer}
            onSave={(updatedData) => {
              setSelectedAnswer(updatedData);
            }}
          />
          ) : (
            <div className="loading">Select a question to view answer.</div>
          )}
        </div>
      ) : (
        <>
          <h1>Testing AI generated Answers</h1>

          <div className="connection-status">
            <span>
              ✅ Connected to Firebase Project: {db.app.options.projectId}
            </span>

            {rtdbError && (
              <div className="rtdb-warning">
                ⚠️ Realtime Database Warning: {rtdbError?.message}
              </div>
            )}
          </div>

          <ul className="question-list-bar">
            {questions.map((q) => (
              <li
                key={q.id}
                className="question-item"
                onClick={() => handleQuestionClick(q)}
              >
                <div className="question-text">{q.question}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function normalizeStoredAnswer(answerData, fallbackQuestion) {
  if (!answerData) {
    return makeAnswerWrapper(fallbackQuestion, []);
  }

  /*
    Ideal structure:
    {
      answer: {
        question: "...",
        answer: [...]
      },
      timestamp: ...
    }
  */
  if (
    typeof answerData === "object" &&
    answerData !== null &&
    typeof answerData.answer === "object" &&
    answerData.answer !== null &&
    Array.isArray(answerData.answer.answer)
  ) {
    return {
      ...answerData,
      answer: {
        ...answerData.answer,
        question:
          answerData.answer.question ||
          answerData.question ||
          fallbackQuestion ||
          "Question unavailable",
        answer: answerData.answer.answer,
      },
    };
  }

  /*
    Direct structure:
    {
      question: "...",
      answer: [...]
    }
  */
  if (
    typeof answerData === "object" &&
    answerData !== null &&
    Array.isArray(answerData.answer)
  ) {
    return {
      ...answerData,
      answer: {
        question: answerData.question || fallbackQuestion || "Question unavailable",
        answer: answerData.answer,
      },
    };
  }

  /*
    Current RTDB problem structure:
    {
      answer: "{'question': '...', 'answer': [...]}"
    }

    This is Python dict string, not valid JSON.
    parseAnswerString() handles both valid JSON and Python-style string.
  */
  if (
    typeof answerData === "object" &&
    answerData !== null &&
    typeof answerData.answer === "string"
  ) {
    const parsedAnswer = parseAnswerString(answerData.answer);

    if (
      parsedAnswer &&
      typeof parsedAnswer === "object" &&
      Array.isArray(parsedAnswer.answer)
    ) {
      return {
        ...answerData,
        answer: {
          question:
            parsedAnswer.question ||
            answerData.question ||
            fallbackQuestion ||
            "Question unavailable",
          answer: parsedAnswer.answer,
        },
      };
    }

    if (
      parsedAnswer &&
      typeof parsedAnswer === "object" &&
      parsedAnswer.answer &&
      Array.isArray(parsedAnswer.answer.answer)
    ) {
      return {
        ...answerData,
        answer: {
          question:
            parsedAnswer.answer.question ||
            parsedAnswer.question ||
            answerData.question ||
            fallbackQuestion ||
            "Question unavailable",
          answer: parsedAnswer.answer.answer,
        },
      };
    }

    console.warn(
      "answerData.answer is a string but could not be parsed. Backend should save object directly."
    );

    return makeAnswerWrapper(
      answerData.question ||
        extractQuestionFromString(answerData.answer) ||
        fallbackQuestion,
      []
    );
  }

  /*
    Whole snapshot itself is string
  */
  if (typeof answerData === "string") {
    const parsedRoot = parseAnswerString(answerData);

    if (parsedRoot) {
      return normalizeStoredAnswer(parsedRoot, fallbackQuestion);
    }

    return makeAnswerWrapper(
      extractQuestionFromString(answerData) || fallbackQuestion,
      []
    );
  }

  return makeAnswerWrapper(
    answerData.question ||
      answerData.question_text ||
      answerData?.answer?.question ||
      fallbackQuestion ||
      "Question unavailable",
    []
  );
}

function parseAnswerString(value) {
  if (typeof value !== "string") return null;

  const text = value.trim();

  // 1. Proper JSON string
  try {
    return JSON.parse(text);
  } catch {
    console.warn("Normal JSON parse failed. Trying Python-style dict string...");
  }

  // 2. Python dict string from backend str(result)
  // Example: "{'question': '...', 'answer': [{'type': 'markdown'}]}"
  try {
    const jsLikeText = text
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false")
      .replace(/\bNone\b/g, "null");

    return Function(`"use strict"; return (${jsLikeText});`)();
  } catch (err) {
    console.error("Python-style answer parse failed:", err);
    return null;
  }
}

function makeAnswerWrapper(question, blocks) {
  return {
    answer: {
      question: question || "Question unavailable",
      answer: Array.isArray(blocks) ? blocks : [],
    },
  };
}

function extractQuestionFromString(value) {
  if (typeof value !== "string") return "";

  const match = value.match(/["']question["']\s*:\s*["']([^"']+)["']/);
  return match ? match[1] : "";
}

function buildFirestoreError(err) {
  let errorMessage = "Failed to load questions from Firestore.\n\n";

  if (err.code === "failed-precondition") {
    errorMessage += "Firestore API may not be enabled for your project.\n";
    errorMessage +=
      "Please go to Firebase Console -> Firestore Database and click 'Create Database'.";
  } else if (err.code === "permission-denied") {
    errorMessage += "Firestore security rules are blocking access.\n";
    errorMessage += "For testing, temporarily allow read access.";
  } else {
    errorMessage += `Error: ${err.message}\n\n`;
    errorMessage += "Please check:\n";
    errorMessage += "1. Firebase configuration is correct\n";
    errorMessage += "2. Firestore is enabled\n";
    errorMessage += "3. 'questions' collection exists\n";
    errorMessage += "4. Documents have question/question_text field\n";
    errorMessage += "5. Internet connection is working";
  }

  return errorMessage;
}
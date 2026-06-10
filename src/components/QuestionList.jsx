import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("Attempting to fetch questions from Firestore...");
        console.log("Using Firebase project:", db.app.options.projectId);
        
        const querySnapshot = await getDocs(collection(db, "questions"));
        console.log("Firestore query successful. Document count:", querySnapshot.size);
        
        if (querySnapshot.empty) {
          setError("No documents found in 'questions' collection. Please add a document with a 'question' field.");
          setLoading(false);
          return;
        }
        
        const fetchedQuestions = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Document data:", data);
          fetchedQuestions.push({ id: doc.id, ...data });
        });
        console.log("Fetched questions:", fetchedQuestions);
        setQuestions(fetchedQuestions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching questions: ", err);
        // Provide more specific error guidance
        let errorMessage = "Failed to load questions from Firestore.\n\n";
        
        if (err.code === 'failed-precondition') {
          errorMessage += "Firestore API may not be enabled for your project.\n";
          errorMessage += "Please go to Firebase Console -> Firestore Database and click 'Create Database'.";
        } else if (err.code === 'permission-denied') {
          errorMessage += "Firestore security rules are blocking access.\n";
          errorMessage += "For testing, temporarily set rules to allow read access:\n";
          errorMessage += "rules_version = '2';\n";
          errorMessage += "service cloud.firestore {\n";
          errorMessage += "  match /databases/{database}/documents {\n";
          errorMessage += "    match /{document=**} {\n";
          errorMessage += "      allow read, write: if true; // ONLY FOR DEVELOPMENT!\n";
          errorMessage += "    }\n";
          errorMessage += "  }\n";
          errorMessage += "}";
        } else {
          errorMessage += `Error details: ${err.message}\n\n`;
          errorMessage += "Please check:\n";
          errorMessage += "1. Firebase configuration is correct\n";
          errorMessage += "2. Firestore is enabled in your Firebase project\n";
          errorMessage += "3. 'questions' collection exists\n";
          errorMessage += "4. Document has a 'question' field\n";
          errorMessage += "5. Internet connection is working\n";
          errorMessage += "6. No firewall blocking Firebase domains";
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) return <div>Loading questions from Firestore...</div>;
  if (error) return <div style={{ 
    backgroundColor: '#ffebee', 
    color: '#c62828', 
    padding: '20px', 
    borderRadius: '4px',
    borderLeft: '4px solid #f44336',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    fontSize: '14px'
  }}><h2>⚠️ Firestore Connection Error</h2><pre>{error}</pre></div>;

  return (
    <div className="question-list">
      <h1>Questions from Firestore</h1>
      <div style={{ 
        backgroundColor: '#e8f5e8', 
        color: '#2e7d32', 
        padding: '10px', 
        borderRadius: '4px', 
        fontSize: '14px',
        marginBottom: '20px',
        borderLeft: '4px solid #4caf50'
      }}>
        ✅ Connected to Firebase Project: {db.app.options.projectId}
      </div>
      <ul className="question-list-bar">
        {questions.map((q) => (
          <li 
            key={q.id} 
            className="question-item"
            onClick={() => {
              // Handle click - could navigate to detail view, etc.
              alert(`Clicked: ${q.question || "No question text"}`);
            }}
          >
            {q.question || "No question text"}
          </li>
        ))}
      </ul>
    </div>
  );
}
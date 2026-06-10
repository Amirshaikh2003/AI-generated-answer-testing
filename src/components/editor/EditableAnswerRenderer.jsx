import { useEffect, useState } from "react";
import AnswerRenderer from "../AnswerRenderer";
import AnswerToolbar from "./AnswerToolbar";
import AddBlockMenu from "./AddBlockMenu";
import BlockEditor from "./BlockEditor";

export default function EditableAnswerRenderer({ data, onSave }) {
  console.log("✅ EditableAnswerRenderer loaded");

  const normalized = normalizeAnswerData(data);

const [isEditing, setIsEditing] = useState(false);
const [showAddMenu, setShowAddMenu] = useState(false);
const [editableBlocks, setEditableBlocks] = useState([]);
const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setEditableBlocks(normalized.blocks);
  }, [data]);

  const updateBlock = (index, updatedBlock) => {
    setEditableBlocks((prev) =>
      prev.map((block, i) => (i === index ? updatedBlock : block))
    );
  };

  const deleteBlock = (index) => {
    setEditableBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const addBlock = (type) => {
    setEditableBlocks((prev) => [...prev, createEmptyBlock(type)]);
    setShowAddMenu(false);
  };

  const saveChanges = () => {
    const updatedData = {
      ...data,
      answer: {
        ...(data.answer || {}),
        question: normalized.question,
        answer: editableBlocks,
      },
      updatedAt: Date.now(),
    };

    onSave?.(updatedData);
    setIsEditing(false);
    setShowAddMenu(false);
  };

  const cancelEdit = () => {
    setEditableBlocks(normalized.blocks);
    setIsEditing(false);
    setShowAddMenu(false);
  };

  const rendererData = {
    ...data,
    answer: {
      ...(data?.answer || {}),
      question: normalized.question,
      answer: editableBlocks,
    },
  };

  return (
  <div className="editable-answer-page">
    {isEditing && showAddMenu && <AddBlockMenu onAdd={addBlock} />}

    {!isEditing ? (
      <>
        <AnswerRenderer data={rendererData} />

        <AnswerToolbar
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={saveChanges}
          onCancel={cancelEdit}
          onAddBlock={() => setShowAddMenu((prev) => !prev)}
        />
      </>
    ) : (
      <>
        <div className="answer-container">
          <div className="question-header">
            <div className="question-label">Question</div>
            <h1>{normalized.question}</h1>
          </div>

          {editableBlocks.length === 0 ? (
            <div className="block empty-answer">
              No blocks available. Click Add Block to create one.
            </div>
          ) : (
            editableBlocks.map((block, index) => (
              <BlockEditor
                key={block.id || `${block.type}-${index}`}
                block={block}
                index={index}
                onChange={updateBlock}
                onDelete={deleteBlock}
              />
            ))
          )}
        </div>

        <AnswerToolbar
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={saveChanges}
          onCancel={cancelEdit}
          onAddBlock={() => setShowAddMenu((prev) => !prev)}
        />
      </>
    )}
  </div>
);
}

function normalizeAnswerData(data) {
  if (
    data?.answer &&
    typeof data.answer === "object" &&
    Array.isArray(data.answer.answer)
  ) {
    return {
      question: data.answer.question || data.question || "Question unavailable",
      blocks: data.answer.answer,
    };
  }

  if (data?.question && Array.isArray(data?.answer)) {
    return {
      question: data.question,
      blocks: data.answer,
    };
  }

  return {
    question:
      data?.answer?.question ||
      data?.question ||
      "Question unavailable",
    blocks: [],
  };
}

function createEmptyBlock(type) {
  const id = `${type}-${Date.now()}`;

  switch (type) {
    case "markdown":
      return {
        id,
        type: "markdown",
        title: "New Text",
        content: "Write your content here...",
      };

    case "image":
      return {
        id,
        type: "image",
        title: "New Image",
        url: "",
        search_query: "",
        recommended_websites: [],
      };

    case "table":
      return {
        id,
        type: "table",
        title: "New Table",
        columns: ["Column 1", "Column 2"],
        rows: [["", ""]],
      };

    case "steps":
      return {
        id,
        type: "steps",
        title: "New Steps",
        items: [{ content: "First step" }],
      };

    case "code":
      return {
        id,
        type: "code",
        title: "New Code",
        language: "text",
        content: "",
      };

    case "mermaid":
      return {
        id,
        type: "mermaid",
        title: "New Diagram",
        diagram_type: "flowchart",
        content: "A[Start] --> B[End]",
      };

    default:
      return {
        id,
        type: "markdown",
        title: "New Block",
        content: "",
      };
  }
}
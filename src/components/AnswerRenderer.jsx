import MarkdownBlock from "./MarkdownBlock.jsx";
import ImageBlock from "./ImageBlock.jsx";
import TableBlock from "./TableBlock.jsx";
import StepsBlock from "./StepsBlock.jsx";
import CodeBlock from "./CodeBlock.jsx";
import MermaidBlock from "./MermaidBlock.jsx";

export default function AnswerRenderer({ data }) {
  if (!data) return null;

  const normalized = normalizeAnswerData(data);
  const question = normalized.question;
  const blocks = normalized.blocks;

  return (
    <div className="answer-container">
      <div className="question-header">
        <div className="question-label">Question</div>
        <h1>{question}</h1>
      </div>

      <div className="answer-content">
        {blocks.length === 0 ? (
          <div className="block empty-answer">
            <h2>Answer blocks not found</h2>
            <p>Data was loaded, but no valid answer blocks were found.</p>
          </div>
        ) : (
          blocks.map((block, index) => renderBlock(block, index))
        )}
      </div>
    </div>
  );
}

function renderBlock(block, index) {
  if (!block || typeof block !== "object") {
    return null;
  }

  const key = block.id || `${block.type || "block"}-${index}`;

  switch (block.type) {
    case "markdown":
      return <MarkdownBlock key={key} block={block} />;

    case "image":
      return <ImageBlock key={key} block={block} />;

    case "table":
      return <TableBlock key={key} block={block} />;

    case "steps":
      return <StepsBlock key={key} block={block} />;

    case "code":
      return <CodeBlock key={key} block={block} />;

    case "mermaid":
      return <MermaidBlock key={key} block={block} />;

    default:
      return (
        <div key={key} className="unknown-block">
          Unsupported block type: {block.type || "unknown"}
        </div>
      );
  }
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
    question: data?.answer?.question || data?.question || "Question unavailable",
    blocks: [],
  };
}

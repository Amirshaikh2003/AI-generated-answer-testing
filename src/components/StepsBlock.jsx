import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function StepsBlock({ block }) {
  const title = block?.title || "Steps";
  const items = normalizeSteps(block?.items || block?.steps || []);

  return (
    <div className="block steps-block">
      <h2 className="block-title">{title}</h2>

      {items.length === 0 ? (
        <p className="block-content-placeholder">No steps available.</p>
      ) : (
        <div className="steps-timeline">
          {items.map((item, index) => (
            <div className="step-card" key={index}>
              <div className="step-badge">{index + 1}</div>

              <div className="step-body">
                {item.title && <h3 className="step-title">{item.title}</h3>}

                <div className="step-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {String(item.content || "")}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function normalizeSteps(items) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    if (typeof item === "string") {
      return {
        content: cleanStepText(fixMathSyntax(item)),
      };
    }

    return {
      ...item,
      content: cleanStepText(
        fixMathSyntax(item.content || item.text || item.description || "")
      ),
    };
  });
}
function fixMathSyntax(text) {
  if (typeof text !== "string") return "";

  return text
    // Fix curly quotes / prime symbols
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/′/g, "'")
    .replace(/″/g, "''")

    // Convert LaTeX delimiters
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$");
}
function cleanStepText(text) {
  if (typeof text !== "string") return "";

  return text.replace(/^\d+\.\s*/, "").replace(/\s+/g, " ").trim();
}
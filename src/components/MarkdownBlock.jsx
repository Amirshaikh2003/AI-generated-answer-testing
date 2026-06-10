import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function MarkdownBlock({ block, content, title }) {
  const finalTitle = block?.title || title || "";

  const rawContent =
    block?.content ||
    block?.text ||
    block?.description ||
    content ||
    "";

  const finalContent = fixMathSyntax(String(rawContent));

  if (!finalContent) {
    return (
      <div className="block markdown-block empty">
        {finalTitle && <h3 className="block-title">{finalTitle}</h3>}
        <div className="block-content-placeholder">No content available</div>
      </div>
    );
  }

  return (
    <div className="block markdown-block">
      {finalTitle && <h3 className="block-title">{finalTitle}</h3>}

      <div className="block-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {finalContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function fixMathSyntax(text) {
  if (typeof text !== "string") return "";

  return text
    // Fix curly quotes / prime symbols
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/′/g, "'")
    .replace(/″/g, "''")

    // Convert \( ... \) to $ ... $
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")

    // Convert \[ ... \] to $$ ... $$
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")

    // Remove extra spaces around inline math delimiters
    .replace(/\$\s+/g, "$")
    .replace(/\s+\$/g, "$");
}
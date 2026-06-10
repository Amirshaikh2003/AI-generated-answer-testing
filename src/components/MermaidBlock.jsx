import { useEffect, useMemo, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  theme: "default",
});

export default function MermaidBlock({ block }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  const title = block?.title || "Diagram";
  const diagramType = block?.diagram_type || "flowchart";
  const rawContent = block?.content || block?.diagram || "";

  const mermaidCode = useMemo(() => {
    return normalizeMermaidCode(rawContent, diagramType);
  }, [rawContent, diagramType]);

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      setSvg("");
      setError("");

      if (!mermaidCode) {
        setError("No diagram content available.");
        return;
      }

      try {
        const id = `mermaid-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

        const result = await mermaid.render(id, mermaidCode);

        if (isMounted) {
          setSvg(result.svg);
        }
      } catch (err) {
        console.error("Mermaid render failed:", err);
        console.log("Failed Mermaid Code:", mermaidCode);

        if (isMounted) {
          setError("Diagram could not be rendered.");
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [mermaidCode]);

  return (
    <div className="block mermaid-block">
      <h2 className="block-title">{title}</h2>

      {svg ? (
        <div
          className="mermaid-container"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre className="mermaid-fallback">
          {error ? `${error}\n\n${mermaidCode}` : mermaidCode}
        </pre>
      )}
    </div>
  );
}

function normalizeMermaidCode(content, diagramType) {
  if (!content || typeof content !== "string") return "";

  let code = content.trim();

  code = removeMarkdownFence(code);

  if (isValidMermaidStart(code)) {
    return code;
  }

  if (diagramType === "flowchart" || looksLikeFlowchart(code)) {
    return normalizeFlowchartCode(code);
  }

  return normalizeFlowchartCode(code);
}

function removeMarkdownFence(code) {
  return code
    .replace(/^```mermaid\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function isValidMermaidStart(code) {
  return (
    code.startsWith("flowchart ") ||
    code.startsWith("graph ") ||
    code.startsWith("sequenceDiagram") ||
    code.startsWith("classDiagram") ||
    code.startsWith("stateDiagram") ||
    code.startsWith("stateDiagram-v2") ||
    code.startsWith("erDiagram") ||
    code.startsWith("journey") ||
    code.startsWith("gantt") ||
    code.startsWith("pie")
  );
}

function looksLikeFlowchart(code) {
  return (
    code.includes("-->") ||
    code.includes("---") ||
    code.includes("-.->") ||
    code.includes("==>")
  );
}

function normalizeFlowchartCode(code) {
  let cleaned = code.trim();

  /*
    Fix backend format:
    TD[A(Start)] --> B{Choose Data Structure}

    Convert to:
    flowchart TD
    A(Start) --> B{Choose Data Structure}
  */
  const badDirectionNodeMatch = cleaned.match(/^(TD|LR|BT|RL)\[([^\]]+)\](.*)$/);

  if (badDirectionNodeMatch) {
    const direction = badDirectionNodeMatch[1];
    const firstNode = badDirectionNodeMatch[2];
    const rest = badDirectionNodeMatch[3];

    cleaned = `${firstNode}${rest}`.trim();

    return `flowchart ${direction}\n${cleaned}`;
  }

  /*
    Fix format:
    TD A --> B
    LR A --> B
  */
  const directionSpaceMatch = cleaned.match(/^(TD|LR|BT|RL)\s+(.+)$/);

  if (directionSpaceMatch) {
    const direction = directionSpaceMatch[1];
    const rest = directionSpaceMatch[2];

    return `flowchart ${direction}\n${rest}`;
  }

  /*
    Fix format:
    graph TD; A --> B
  */
  if (cleaned.startsWith("graph ")) {
    return cleaned;
  }

  return `flowchart TD\n${cleaned}`;
}
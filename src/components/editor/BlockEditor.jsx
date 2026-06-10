export default function BlockEditor({ block, index, onChange, onDelete }) {
  const type = block?.type || "markdown";

  const updateField = (field, value) => {
    onChange(index, {
      ...block,
      [field]: value,
    });
  };

  return (
    <div className="block block-editor-card">
      <div className="editor-card-top">
        <span className="block-type-pill">{type.toUpperCase()}</span>

        <button className="delete-block-btn" onClick={() => onDelete(index)}>
          Delete
        </button>
      </div>

      <input
        className="inline-title-input"
        value={block.title || ""}
        onChange={(e) => updateField("title", e.target.value)}
        placeholder="Block title"
      />

      {type === "markdown" && (
        <textarea
          className="inline-content-textarea"
          value={block.content || ""}
          onChange={(e) => updateField("content", e.target.value)}
          placeholder="Write content..."
          rows={8}
        />
      )}

      {type === "image" && (
        <>
          <input
            className="inline-input"
            value={block.url || ""}
            onChange={(e) => updateField("url", e.target.value)}
            placeholder="Image URL"
          />

          <input
            className="inline-input"
            value={block.search_query || ""}
            onChange={(e) => updateField("search_query", e.target.value)}
            placeholder="Search query"
          />
        </>
      )}

      {type === "table" && (
        <TableEditor block={block} index={index} onChange={onChange} />
      )}

      {type === "steps" && (
        <StepsEditor block={block} index={index} onChange={onChange} />
      )}

      {type === "code" && (
        <>
          <input
            className="inline-input"
            value={block.language || ""}
            onChange={(e) => updateField("language", e.target.value)}
            placeholder="Language"
          />

          <textarea
            className="inline-content-textarea code-editor-area"
            value={block.content || ""}
            onChange={(e) => updateField("content", e.target.value)}
            placeholder="Write code..."
            rows={10}
          />
        </>
      )}

      {type === "mermaid" && (
        <textarea
          className="inline-content-textarea code-editor-area"
          value={block.content || ""}
          onChange={(e) => updateField("content", e.target.value)}
          placeholder="Write Mermaid diagram code..."
          rows={8}
        />
      )}
    </div>
  );
}

function TableEditor({ block, index, onChange }) {
  const columns = Array.isArray(block.columns) ? block.columns : [];
  const rows = Array.isArray(block.rows) ? block.rows : [];

  const updateTable = (newColumns, newRows) => {
    onChange(index, {
      ...block,
      columns: newColumns,
      rows: newRows,
    });
  };

  const updateColumn = (colIndex, value) => {
    const newColumns = [...columns];
    newColumns[colIndex] = value;
    updateTable(newColumns, rows);
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = rows.map((row) => [...row]);
    newRows[rowIndex][colIndex] = value;
    updateTable(columns, newRows);
  };

  const addColumn = () => {
    updateTable(
      [...columns, "New Column"],
      rows.map((row) => [...row, ""])
    );
  };

  const addRow = () => {
    updateTable(columns, [...rows, columns.map(() => "")]);
  };

  return (
    <div className="inline-table-editor">
      <div className="editor-actions">
        <button type="button" onClick={addColumn}>
          + Column
        </button>
        <button type="button" onClick={addRow}>
          + Row
        </button>
      </div>

      <div className="table-scroll">
        <table className="answer-table">
          <thead>
            <tr>
              {columns.map((col, colIndex) => (
                <th key={colIndex}>
                  <input
                    className="table-cell-input"
                    value={col}
                    onChange={(e) => updateColumn(colIndex, e.target.value)}
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <td key={colIndex}>
                    <textarea
                      className="table-cell-textarea"
                      value={row[colIndex] || ""}
                      onChange={(e) =>
                        updateCell(rowIndex, colIndex, e.target.value)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StepsEditor({ block, index, onChange }) {
  const items = Array.isArray(block.items) ? block.items : [];

  const updateSteps = (newItems) => {
    onChange(index, {
      ...block,
      items: newItems,
    });
  };

  const updateStep = (stepIndex, value) => {
    const newItems = [...items];

    if (typeof newItems[stepIndex] === "string") {
      newItems[stepIndex] = value;
    } else {
      newItems[stepIndex] = {
        ...newItems[stepIndex],
        content: value,
      };
    }

    updateSteps(newItems);
  };

  const addStep = () => {
    updateSteps([...items, { content: "New step" }]);
  };

  return (
    <div className="inline-steps-editor">
      <div className="editor-actions">
        <button type="button" onClick={addStep}>
          + Step
        </button>
      </div>

      {items.map((item, stepIndex) => (
        <div className="step-edit-row" key={stepIndex}>
          <div className="step-edit-number">{stepIndex + 1}</div>

          <textarea
            className="inline-content-textarea"
            value={
              typeof item === "string"
                ? item
                : item.content || item.text || item.description || ""
            }
            onChange={(e) => updateStep(stepIndex, e.target.value)}
            rows={3}
          />
        </div>
      ))}
    </div>
  );
}
export default function AnswerToolbar({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onAddBlock,
  onShare,
  onLike,
  onDislike,
  feedback,
}) {
  return (
    <div className="answer-toolbar">
      {!isEditing ? (
        <>
          <button className="toolbar-btn primary large-action" onClick={onEdit}>
            ✏️ Edit Answer
          </button>

          <div className="toolbar-spacer"></div>

          <button className="toolbar-btn secondary-action" onClick={onShare}>
            🔗 Share
          </button>

          <button
            className={`toolbar-btn icon-action ${
              feedback === "like" ? "active-like" : ""
            }`}
            onClick={onLike}
            title="Like"
          >
            👍
          </button>

          <button
            className={`toolbar-btn icon-action ${
              feedback === "dislike" ? "active-dislike" : ""
            }`}
            onClick={onDislike}
            title="Dislike"
          >
            👎
          </button>
        </>
      ) : (
        <>
          <button className="toolbar-btn success-action" onClick={onSave}>
            💾 Save
          </button>

          <button className="toolbar-btn secondary-action" onClick={onAddBlock}>
            ➕ Add Block
          </button>

          <button className="toolbar-btn danger" onClick={onCancel}>
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
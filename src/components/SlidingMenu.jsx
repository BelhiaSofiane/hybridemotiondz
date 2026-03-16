export default function SlidingMenu({ open, onClose, onNavigate, currentView }) {
  const handleClick = (target) => {
    onNavigate(target);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${open ? "drawer-backdrop-open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={`drawer ${open ? "drawer-open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-title">HybridEmotion DZ</div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            ×
          </button>
        </div>

        <nav className="drawer-nav">
          <button
            type="button"
            className={`drawer-item ${
              currentView === "analyze" ? "drawer-item-active" : ""
            }`}
            onClick={() => handleClick("analyze")}
          >
            Analyser
          </button>

          <button
            type="button"
            className={`drawer-item ${
              currentView === "about" ? "drawer-item-active" : ""
            }`}
            onClick={() => handleClick("about")}
          >
            À propos
          </button>
        </nav>
      </aside>
    </>
  );
}


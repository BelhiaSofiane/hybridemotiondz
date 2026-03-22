import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", end: true, label: "Accueil" },
  { to: "/analyze", end: false, label: "Analyser IHL" },
  { to: "/clients", end: false, label: "Analyser Clients" },
  { to: "/about", end: false, label: "À propos" },
];

export default function SlidingMenu({ open, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${open ? "drawer-backdrop-open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Drawer */}
      <aside
        className={`drawer ${open ? "drawer-open" : ""}`}
        aria-hidden={!open}
        aria-label="Menu de navigation"
      >
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
          {navItems.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `drawer-item ${isActive ? "drawer-item-active" : ""}`
              }
              onClick={onClose}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

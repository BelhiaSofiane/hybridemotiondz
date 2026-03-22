import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SlidingMenu from "./SlidingMenu";
import "../App.css";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="phone">
      <Header onMenuToggle={() => setMenuOpen(true)} />
      <SlidingMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

import React from "react";
import DropdownHeader from "./DropdownHeader/DropdownHeader";
import { Search, Menu } from "lucide-react";

function Header({ onOpenSidebar, onOpenModal }) {
    return (
        <header className="header">
            <button
                className="icon-btn mobile-menu-btn"
                onClick={onOpenSidebar}
                aria-label="Open menu"
            >
                <Menu className="icon" />
            </button>

            <button
                className="header-search"
                onClick={() => onOpenModal && onOpenModal("commandPalette")}
            >
                <Search className="icon icon-sm" />
                <span className="search-label">Search anything…</span>
                <kbd>Ctrl K</kbd>
            </button>

            <DropdownHeader onOpenModal={onOpenModal} />
        </header>
    );
}

export default Header;
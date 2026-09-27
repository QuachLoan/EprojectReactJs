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

            <DropdownHeader onOpenModal={onOpenModal} />
        </header>
    );
}

export default Header;
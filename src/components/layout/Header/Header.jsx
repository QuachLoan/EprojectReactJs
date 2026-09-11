import { useState } from "react";
import DropdownHeader from "./DropdownHeader/DropdownHeader";

function Header(){
     const [isOpen, setIsOpen] = useState(false);
    return(
        <>
    <header class="header">
        <button class="icon-btn mobile-menu-btn" data-action="open-sidebar" aria-label="Open menu"><span class="icon" data-icon="menu"></span></button>
        <button class="header-search" data-open-modal="commandPalette">
          <span class="icon icon-sm" data-icon="search"></span>
          <span class="search-label">Search anything…</span>
          <kbd>Ctrl K</kbd>
        </button>
        <DropdownHeader/>
      </header>
        </>
    )
}
export default Header;
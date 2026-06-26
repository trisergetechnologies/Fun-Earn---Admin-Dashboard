"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { BoxIcon, HorizontaLDots, LockIcon } from "@/icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
};

const navItems: NavItem[] = [
  { icon: <BoxIcon />, name: "Products", path: "/seller/product" },
  { icon: <LockIcon />, name: "Change Password", path: "/seller/change-password" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/seller/product" className="flex items-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-wide">
              MP Dreams
            </span>
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-lg font-bold text-white shadow-md">
              M
            </span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <h2
            className={`mb-4 text-xs uppercase text-gray-400 ${
              !isExpanded && !isHovered ? "lg:text-center" : ""
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? "Seller Menu" : <HorizontaLDots />}
          </h2>
          <ul className="flex flex-col gap-4">
            {navItems.map((nav) => (
              <li key={nav.name}>
                {nav.path && (
                  <Link
                    href={nav.path}
                    className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                  >
                    <span className={isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;

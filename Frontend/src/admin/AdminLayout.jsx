import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UsersRound,
  Tag,
  Layers,
  CreditCard,
  ShieldCheck,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { useState, useRef, useEffect } from "react";
import ScrollToTop from "../ScrollToTop";
import Logo from "../assets/logo.jpg";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef();

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#F6F3FA]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <ScrollToTop />

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          ${open ? "w-64" : "w-20"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          bg-white/90 backdrop-blur-xl border-r
          h-full flex flex-col z-50 fixed md:static
          transition-all duration-300
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center gap-3">
            <img
              src={Logo}
              alt="EZY Voice"
              className={`object-contain rounded-md transition-all duration-300 ${
                open ? "w-10 h-10" : "w-12 h-12 mx-auto"
              }`}
            />

            {open && (
              <h1 className="text-xl font-extrabold tracking-wide text-[#0F172A] whitespace-nowrap">
                EZY{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8746FF] to-[#F021B9]">
                  VOICE
                </span>
              </h1>
            )}
          </div>

          <X
            className="cursor-pointer text-gray-700 md:hidden"
            onClick={() => setMobileOpen(false)}
          />

          <Menu
            className="cursor-pointer text-gray-700 hidden md:block"
            onClick={() => setOpen(!open)}
          />
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {open && (
            <p className="text-[#64748B] text-xs font-semibold uppercase pl-2 mt-3 mb-1">
              Main
            </p>
          )}

          <NavItem to="/admin" end icon={<LayoutDashboard />} label="Dashboard" open={open} />
          <NavItem to="/admin/users" icon={<UsersRound />} label="Users" open={open} />
          {/* Added Paid Users under MAIN */}
          <NavItem to="/admin/plan-users" icon={<CreditCard />} label="Paid Users" open={open} />

          {open && (
            <p className="text-[#64748B] text-xs font-semibold uppercase pl-2 mt-4 mb-1">
              Management
            </p>
          )}

          <NavItem to="/admin/offers" icon={<Tag />} label="Offers" open={open} />
          <NavItem to="/admin/plans" icon={<Layers />} label="Plans" open={open} />
          <NavItem to="/admin/transactions" icon={<CreditCard />} label="Transactions" open={open} />

          {open && (
            <p className="text-[#64748B] text-xs font-semibold uppercase pl-2 mt-4 mb-1">
              System
            </p>
          )}

          <NavItem to="/admin/roles" icon={<ShieldCheck />} label="Admin Roles" open={open} />
        </nav>
      </aside>

      {/* MAIN SECTION */}
      <div className="flex-1 flex flex-col h-full">
        {/* TOP NAVBAR */}
        <header
          className="w-full h-16 flex-shrink-0 bg-white/60 backdrop-blur-xl border-b px-6 
                     flex items-center justify-between relative z-30"
        >
          <div className="flex items-center gap-3">
            <Menu
              className="md:hidden cursor-pointer text-gray-700"
              size={24}
              onClick={() => setMobileOpen(true)}
            />

            <h1 className="text-xl font-extrabold tracking-wide text-[#0F172A] whitespace-nowrap">
              Admin{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8746FF] to-[#F021B9]">
                Dashboard
              </span>
            </h1>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* SEARCH */}
            <div className="hidden md:flex items-center bg-white px-3 py-1.5 rounded-lg border shadow-sm">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="ml-2 outline-none text-sm text-gray-700 bg-transparent"
              />
            </div>

            {/* BELL */}
            <Bell
              size={22}
              className="text-gray-700 cursor-pointer hover:text-[#8746FF]"
            />

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <img
                  src="https://i.pravatar.cc/50"
                  alt="profile"
                  className="w-9 h-9 rounded-full border"
                />
                <ChevronDown className="text-gray-600 hidden md:block" size={18} />
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-44 bg-white/90 backdrop-blur-xl border shadow-lg rounded-xl p-2 z-50">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F1E9FF] text-gray-700">
                    <User size={18} /> My Profile
                  </button>

                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F1E9FF] text-gray-700">
                    <Settings size={18} /> Settings
                  </button>

                  <hr className="my-2 border-gray-200" />

                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl p-6 min-h-full border">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* NAV ITEM COMPONENT */
function NavItem({ to, icon, label, open, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `
        flex items-center gap-3 p-2.5 rounded-lg transition-all
        ${
          isActive
            ? "bg-gradient-to-r from-[#8746FF]/20 to-[#F021B9]/20 text-[#8746FF] font-semibold"
            : "text-gray-700 hover:bg-[#F1E9FF] hover:text-[#8746FF]"
        }
      `
      }
    >
      <span className="text-[19px]">{icon}</span>
      {open && <span className="font-medium">{label}</span>}
    </NavLink>
  );
}

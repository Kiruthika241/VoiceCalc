import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Settings,
  User,
  CreditCard,
  Headphones,
  LogOut,
  Mic,
  History,
} from "lucide-react";
import { getCurrentUser, clearAuth } from "../utlis/auth";

import Logo from "../assets/logo.jpg";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const settingsRef = useRef(null);

  const user = getCurrentUser();
  const userInitial = user
    ? ((user.name || user.email || "?").trim()[0] || "?").toUpperCase()
    : null;

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Voice Mode", path: "/voice" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    setSettingsOpen(false);
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    clearAuth();
    setSettingsOpen(false);
    setOpen(false);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/95 backdrop-blur-md shadow-md border-b border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-5 sm:p-4 md:px-8 md:py-3 lg:px-12 lg:py-4">

        {/* --- LOGO (JPG imported) --- */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={Logo}
            alt="App Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain rounded-md"
          />

          <h1 className="text-lg sm:text-xl font-bold text-gray-100 tracking-wide">
            EZY <span className="text-pink-500">VOICE</span>
          </h1>
        </div>

        {/* --- DESKTOP NAVIGATION --- */}
        <ul className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
          {navItems.map((item) => (
            <li key={item.name} className="relative group">
              <Link
                to={item.path}
                className={`text-gray-300 hover:text-pink-400 text-[13px] md:text-[14px] lg:text-[15px] font-medium transition-all duration-200 ${
                  location.pathname === item.path ? "text-pink-400" : ""
                }`}
              >
                {item.name}
                <span
                  className={`absolute left-1/2 bottom-[-4px] h-[2px] bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300 transform -translate-x-1/2 ${
                    location.pathname === item.path
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
            </li>
          ))}
        </ul>

        {/* --- RIGHT SECTION --- */}
        <div className="hidden md:flex items-center gap-3 md:gap-4 relative">
          <Link
            to="/voice"
            className="px-3 sm:px-4 md:px-5 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-all duration-200 shadow-md flex items-center gap-2"
          >
            <Mic size={16} /> <span className="hidden sm:inline">Voice Mode</span>
          </Link>

          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${
                userInitial
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white border border-slate-700"
              }`}
            >
              {userInitial ? (
                <span className="text-xs md:text-sm font-semibold">
                  {userInitial}
                </span>
              ) : (
                <Settings size={18} />
              )}
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-3 w-52 sm:w-56 bg-slate-900/95 backdrop-blur-lg border border-slate-800 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                {user && (
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                      {userInitial}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-100 text-sm font-medium">
                        {user.name}
                      </span>
                    </div>
                  </div>
                )}

                <ul className="py-2 text-sm text-gray-300">
                  <DropdownItem
                    icon={<User size={16} />}
                    label="My Profile"
                    onClick={() => handleNavigate("/profile")}
                  />
                  <DropdownItem
                    icon={<CreditCard size={16} />}
                    label="Plans & Billing"
                    onClick={() => handleNavigate("/plans")}
                  />
                  <DropdownItem
                    icon={<Headphones size={16} />}
                    label="Support"
                    onClick={() => handleNavigate("/support")}
                  />

                  <hr className="border-slate-700 my-1" />
                  <DropdownItem
                    icon={<History size={16} />}
                    label="History"
                    onClick={() => handleNavigate("/history")}
                  />
                  <DropdownItem
                    icon={<LogOut size={16} />}
                    label="Logout"
                    onClick={handleLogout}
                  />
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* --- MOBILE MENU TOGGLE --- */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-300 hover:text-white transition"
          aria-label="Toggle Menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* --- MOBILE MENU --- */}
      <div
        className={`md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-lg overflow-hidden transition-all duration-500 ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-6 py-6 text-gray-200 text-base px-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                onClick={() => setOpen(false)}
                className="hover:text-pink-400 transition-colors duration-200"
              >
                {item.name}
              </Link>
            </li>
          ))}

          <Link
            to="/voice"
            onClick={() => setOpen(false)}
            className="px-6 py-2 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-medium transition-all duration-200 shadow-md"
          >
            Try Voice Mode
          </Link>

          <div className="flex flex-col gap-4 pt-4 border-t border-slate-800 w-full text-gray-300 text-sm px-4">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 hover:text-pink-400"
            >
              <User size={16} /> My Profile
            </Link>
            <Link
              to="/plans"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 hover:text-pink-400"
            >
              <CreditCard size={16} /> Plans & Billing
            </Link>
            <Link
              to="/support"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 hover:text-pink-400"
            >
              <Headphones size={16} /> Support
            </Link>
            <Link
              to="/history"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 hover:text-pink-400"
            >
              <History size={16} /> History
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 hover:text-pink-400 text-left"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </ul>
      </div>
    </nav>
  );
}

function DropdownItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gradient-to-r from-pink-500/10 to-purple-600/10 hover:text-white transition-all duration-200 text-left"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
import { useState } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  LogIn,
  UserPlus,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api"; // change if backend URL different

export default function Login() {
  const [activeTab, setActiveTab] = useState("signup"); // default: Sign Up first
  const [signupData, setSignupData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    location: "",
  });
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const locationHook = useLocation();
  const redirectTo = locationHook.state?.from || "/voice-popup";

  // Store auth directly (no external helper).
  function storeAuth(user, token) {
    // Normalize token shapes
    let rawToken = "";
    if (!token) rawToken = "";
    else if (typeof token === "string") rawToken = token;
    else if (typeof token === "object") rawToken = token.token || token.accessToken || "";
    else rawToken = String(token);

    // Remove accidental surrounding quotes
    rawToken = rawToken.replace(/^"|"$/g, "");

    // Save
    localStorage.setItem("token", rawToken);
    try {
      localStorage.setItem("user", JSON.stringify(user || {}));
    } catch (err) {
      localStorage.setItem("user", "{}");
      console.warn("Failed to stringify user for storage", err);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (activeTab === "signup") {
        const { name, phone, email, password, location } = signupData;
        if (!name || !phone || !email || !password || !location) {
          setError("Please fill in all sign up fields.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, email, password, location }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Signup failed.");
          setLoading(false);
          return;
        }

        setSuccess("Sign up successful! Please log in to continue.");
        setError("");
        setActiveTab("login");
        setLoginData((prev) => ({ ...prev, identifier: email }));
        setLoading(false);
      } else {
        const { identifier, password } = loginData;
        if (!identifier || !password) {
          setError("Please enter identifier and password.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Login failed.");
          setLoading(false);
          return;
        }

        // normalize returned shapes: try to find user and token
        const user = data.user || data.data?.user || data.data?.userInfo || null;
        const token =
          data.token ||
          data.accessToken ||
          data.data?.token ||
          data.data?.accessToken ||
          (typeof data === "string" ? data : null);

        // fallback: if backend returned { user: {...}, token: "..." } it's handled
        // store them anyway; storeAuth will handle many shapes
        storeAuth(user || data.user || {}, token || "");

        // navigate to where user was headed
        navigate(redirectTo);
      }
    } catch (err) {
      console.error("Login/Signup error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 overflow-hidden px-4 sm:px-8">
      <div className="absolute -top-40 -left-40 w-[350px] h-[350px] bg-pink-400/25 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-400/25 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <section className="text-center mt-24 sm:mt-32 mb-6 sm:mb-10 md:mb-12 lg:mb-14 z-10 px-2 animate-fadeIn">
        <h3 className="text-xs sm:text-sm font-semibold text-pink-600 tracking-[0.25em] uppercase mb-4 relative inline-block">
          Empower. Express. Elevate.
          <span className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-12 h-[2px] bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></span>
        </h3>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-2 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            Speak Smarter.
          </span>{" "}
          Think Louder.
        </h1>

        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl mx-auto px-2">
          Transform your voice into action — where innovation meets expression.
        </p>
      </section>

      <div
        className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl 
      pt-10 px-5 pb-5 sm:p-8 md:p-10 transition-all duration-500 z-10 animate-slideUp mb-8 sm:mb-14 md:mb-20"
      >
        <button
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-pink-600 transition"
          onClick={() => navigate(-1)}
        >
          <X size={22} />
        </button>

        <div className="flex mb-8 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <button
            className={`flex-1 py-2 sm:py-3 text-sm font-semibold transition-all duration-300 ${
              activeTab === "signup"
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                : "text-gray-500 hover:text-gray-700 bg-gray-100"
            }`}
            onClick={() => {
              setError("");
              setSuccess("");
              setActiveTab("signup");
            }}
          >
            Sign Up
          </button>

          <button
            className={`flex-1 py-2 sm:py-3 text-sm font-semibold transition-all duration-300 ${
              activeTab === "login"
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                : "text-gray-500 hover:text-gray-700 bg-gray-100"
            }`}
            onClick={() => {
              setError("");
              setSuccess("");
              setActiveTab("login");
            }}
          >
            Log In
          </button>
        </div>

        {error && (
          <p className="mb-3 text-xs sm:text-sm text-red-500 text-center">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-3 text-xs sm:text-sm text-green-600 text-center">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === "signup" ? (
            <>
              <InputField
                icon={<User size={18} />}
                placeholder="Full Name"
                type="text"
                value={signupData.name}
                onChange={(e) =>
                  setSignupData({ ...signupData, name: e.target.value })
                }
              />
              <InputField
                icon={<Phone size={18} />}
                placeholder="Mobile Number"
                type="tel"
                value={signupData.phone}
                onChange={(e) =>
                  setSignupData({ ...signupData, phone: e.target.value })
                }
              />
              <InputField
                icon={<Mail size={18} />}
                placeholder="Email Address"
                type="email"
                value={signupData.email}
                onChange={(e) =>
                  setSignupData({ ...signupData, email: e.target.value })
                }
              />
              <InputField
                icon={<MapPin size={18} />}
                placeholder="Location (City, Country)"
                type="text"
                value={signupData.location}
                onChange={(e) =>
                  setSignupData({ ...signupData, location: e.target.value })
                }
              />
              <InputField
                icon={<Lock size={18} />}
                placeholder="Password"
                type="password"
                value={signupData.password}
                onChange={(e) =>
                  setSignupData({ ...signupData, password: e.target.value })
                }
                isPassword
                showPassword={showSignupPassword}
                onTogglePassword={() =>
                  setShowSignupPassword((prev) => !prev)
                }
              />
            </>
          ) : (
            <>
              <InputField
                icon={<Mail size={18} />}
                placeholder="Email or Mobile Number"
                type="text"
                value={loginData.identifier}
                onChange={(e) =>
                  setLoginData({ ...loginData, identifier: e.target.value })
                }
              />
              <InputField
                icon={<Lock size={18} />}
                placeholder="Password"
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                isPassword
                showPassword={showLoginPassword}
                onTogglePassword={() =>
                  setShowLoginPassword((prev) => !prev)
                }
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 sm:py-3.5 flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-[1.02] hover:opacity-90 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Please wait..."
            ) : activeTab === "signup" ? (
              <>
                <UserPlus size={18} /> Sign up
              </>
            ) : (
              <>
                <LogIn size={18} /> Log in
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs sm:text-sm mt-5">
          By continuing, you agree to our{" "}
          <span className="text-pink-600 font-medium hover:underline cursor-pointer">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-purple-600 font-medium hover:underline cursor-pointer">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </main>
  );
}

/* Reusable Input Component */
function InputField({
  icon,
  placeholder,
  type,
  value,
  onChange,
  isPassword,
  showPassword,
  onTogglePassword,
}) {
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative mb-4">
      <span className="absolute left-3 top-3.5 text-gray-500">{icon}</span>
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full border border-gray-300 rounded-md ${
          isPassword ? "pl-10 pr-10" : "pl-10 pr-3"
        } py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}

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

// Backend API — FIXED
const API_BASE_URL =
  `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "https://post-api-1elw.onrender.com"}/api`;

export default function Login() {
  const [activeTab, setActiveTab] = useState("signup");

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
  const location = useLocation();
  const redirectTo = location.state?.from || "/voice-popup";

  // Store Auth Safely
  function storeAuth(user, token) {
    let fixedToken = token;

    if (typeof fixedToken === "object" && fixedToken?.token) {
      fixedToken = fixedToken.token;
    }

    if (typeof fixedToken !== "string") fixedToken = "";

    fixedToken = fixedToken.replace(/^"|"$/g, "");

    localStorage.setItem("token", fixedToken);
    localStorage.setItem("user", JSON.stringify(user || {}));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      /* -----------------------------------
         SIGNUP
      ------------------------------------- */
      if (activeTab === "signup") {
        const { name, phone, email, password, location } = signupData;

        if (!name || !phone || !email || !password || !location) {
          setError("Please fill in all fields.");
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

        setSuccess("Signup successful! Please log in.");
        setActiveTab("login");
        setLoginData({ ...loginData, identifier: email });
        setLoading(false);
        return;
      }

      /* -----------------------------------
         LOGIN
      ------------------------------------- */
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (_) {}

      if (!res.ok) {
        setError(data?.message || "Invalid credentials.");
        setLoading(false);
        return;
      }

      const user = data.user;
      const token = data.token;

      storeAuth(user, token);

      navigate(redirectTo);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4">
      {/* UI */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6 mt-20">
        <button
          className="absolute top-3 right-3 text-gray-400"
          onClick={() => navigate(-1)}
        >
          <X size={22} />
        </button>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setActiveTab("signup");
            }}
            className={`flex-1 py-2 font-semibold ${
              activeTab === "signup"
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                : "text-gray-500"
            }`}
          >
            Sign Up
          </button>

          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setActiveTab("login");
            }}
            className={`flex-1 py-2 font-semibold ${
              activeTab === "login"
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                : "text-gray-500"
            }`}
          >
            Log In
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {success && <p className="text-green-600 text-center mb-3">{success}</p>}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {activeTab === "signup" ? (
            <>
              <InputField
                icon={<User size={18} />}
                value={signupData.name}
                placeholder="Full Name"
                onChange={(e) =>
                  setSignupData({ ...signupData, name: e.target.value })
                }
              />

              <InputField
                icon={<Phone size={18} />}
                value={signupData.phone}
                placeholder="Phone Number"
                onChange={(e) =>
                  setSignupData({ ...signupData, phone: e.target.value })
                }
              />

              <InputField
                icon={<Mail size={18} />}
                value={signupData.email}
                placeholder="Email"
                type="email"
                onChange={(e) =>
                  setSignupData({ ...signupData, email: e.target.value })
                }
              />

              <InputField
                icon={<MapPin size={18} />}
                value={signupData.location}
                placeholder="Location"
                onChange={(e) =>
                  setSignupData({ ...signupData, location: e.target.value })
                }
              />

              <InputField
                icon={<Lock size={18} />}
                placeholder="Password"
                type="password"
                value={signupData.password}
                isPassword
                showPassword={showSignupPassword}
                onTogglePassword={() =>
                  setShowSignupPassword(!showSignupPassword)
                }
                onChange={(e) =>
                  setSignupData({ ...signupData, password: e.target.value })
                }
              />
            </>
          ) : (
            <>
              <InputField
                icon={<Mail size={18} />}
                placeholder="Email or Phone"
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
                isPassword
                showPassword={showLoginPassword}
                onTogglePassword={() =>
                  setShowLoginPassword(!showLoginPassword)
                }
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
              />
            </>
          )}

          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg flex justify-center"
            disabled={loading}
          >
            {loading ? "Please wait..." : activeTab === "signup" ? "Sign Up" : "Log In"}
          </button>
        </form>
      </div>
    </main>
  );
}

function InputField({
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
  isPassword,
  showPassword,
  onTogglePassword,
}) {
  const finalType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative mb-4">
      <span className="absolute left-3 top-3.5 text-gray-500">{icon}</span>
      <input
        className="w-full border border-gray-300 rounded-md pl-10 pr-10 py-3 text-sm focus:ring-pink-400 focus:border-pink-400"
        type={finalType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {isPassword && (
        <button
          type="button"
          className="absolute right-3 top-3.5 text-gray-500"
          onClick={onTogglePassword}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}

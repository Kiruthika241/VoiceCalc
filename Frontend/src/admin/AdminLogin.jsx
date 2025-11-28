import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Simple auth example
    if (username === "admin" && password === "12345") {
      localStorage.setItem("admin-auth", "true");
      window.location.href = "/admin";
    } else {
      alert("Invalid Username or Password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4">

      <div className="bg-white/80 backdrop-blur-xl border shadow-xl rounded-2xl p-8 w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text mb-6">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Admin Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow-md"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-5">
          © 2025 Admin Panel
        </p>

      </div>
    </div>
  );
}

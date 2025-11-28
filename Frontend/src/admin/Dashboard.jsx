// src/admin/Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Users,
  Mic,
  Globe2,
  Activity,
  Server,
  ArrowUpRight,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [planCounts, setPlanCounts] = useState({});
  const [paidCount, setPaidCount] = useState(0);
  const [voiceCount, setVoiceCount] = useState(null);

  const usageData = [
    { name: "Mon", value: 40 },
    { name: "Tue", value: 55 },
    { name: "Wed", value: 32 },
    { name: "Thu", value: 70 },
    { name: "Fri", value: 52 },
  ];

  const languageData = [
    { name: "English", value: 45 },
    { name: "Hindi", value: 20 },
    { name: "Tamil", value: 12 },
    { name: "Telugu", value: 10 },
    { name: "Kannada", value: 8 },
    { name: "Malayalam", value: 5 },
  ];

  const COLORS = ["#7C3AED", "#EC4899", "#6366F1", "#10B981", "#F59E0B", "#06B6D4"];

  async function safeJson(res) {
    const txt = await res.text();
    try {
      return JSON.parse(txt);
    } catch {
      return txt;
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let voiceInterval = null;

    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      setPlanCounts({});
      setPaidCount(0);
      setTotalUsers(null);
      setVoiceCount(null);

      try {
        // try to get total count from count endpoint
        try {
          const countRes = await fetch(`${API_BASE}/auth/users/count`, { signal });
          if (countRes.ok) {
            const countBody = await safeJson(countRes);
            if (countBody && typeof countBody.count === "number") {
              setTotalUsers(countBody.count);
            }
          }
        } catch (e) {
          // ignore; we'll derive from users list
          console.debug("users count endpoint unavailable or failed:", e?.message ?? e);
        }

        // fetch users
        const usersRes = await fetch(`${API_BASE}/auth/users`, { signal });
        const usersBody = await safeJson(usersRes);
        if (!usersRes.ok) {
          const message = typeof usersBody === "string" ? usersBody : usersBody?.message ?? "Users fetch failed";
          throw new Error(`Users fetch failed: ${message}`);
        }
        const usersArray = Array.isArray(usersBody)
          ? usersBody
          : Array.isArray(usersBody.users)
          ? usersBody.users
          : [];

        // derive totalUsers if count endpoint not provided
        if ((totalUsers === null || totalUsers === undefined) && Array.isArray(usersArray)) {
          setTotalUsers(usersArray.length);
        } else if (Array.isArray(usersArray) && usersArray.length === 0 && (totalUsers === null || totalUsers === undefined)) {
          setTotalUsers(0);
        }

        // fetch plans (best-effort)
        let plansArray = [];
        try {
          const plansRes = await fetch(`${API_BASE}/plans`, { signal });
          const plansBody = await safeJson(plansRes);
          plansArray = plansRes.ok
            ? Array.isArray(plansBody)
              ? plansBody
              : Array.isArray(plansBody.plans)
              ? plansBody.plans
              : []
            : [];
        } catch (e) {
          plansArray = [];
        }

        // Build plan id -> name map
        const idToName = {};
        plansArray.forEach((p) => {
          if (p._id) idToName[String(p._id)] = p.name || p._id;
          else if (p.id) idToName[String(p.id)] = p.name || p.id;
        });

        // compute planCounts and paidCount
        const rawCounts = {};
        let paidCounter = 0;

        const normalizedUsers = usersArray.map((u) => {
          const planField = (u && (u.plan || u.subscription || u.accountPlan || u.role)) || "free";
          let planKey = planField;
          if (typeof planField === "object" && planField !== null) {
            planKey = planField.name || planField._id || planField.id || "unknown";
          }
          planKey = String(planKey || "free");

          if (idToName[planKey]) planKey = idToName[planKey];

          const planName = String(planKey || "free").trim() || "Free";

          const paymentVerified =
            Boolean(u?.paymentVerified) ||
            Boolean(u?.isPaid) ||
            Boolean(u?.paid) ||
            Boolean(u?.payment_status === "verified") ||
            Boolean(u?.subscription?.paymentVerified) ||
            Boolean(u?.subscription?.isPaid);

          const isFree = planName.toLowerCase() === "free";

          return {
            original: u,
            planKey,
            planName,
            paymentVerified,
            isFree,
          };
        });

        // Count plans (map IDs to names if needed)
        normalizedUsers.forEach((nu) => {
          const key = (nu.planName || "free").toString().toLowerCase();
          rawCounts[key] = (rawCounts[key] || 0) + 1;
          if (nu.paymentVerified === true) paidCounter += 1;
        });

        // If no plan keys found, but users exist, treat as free
        if (Object.keys(rawCounts).length === 0 && normalizedUsers.length) {
          rawCounts["free"] = normalizedUsers.length;
        }

        // Remap if keys look like ObjectIds and we have plan list
        const looksLikeObjectId = (s) => /^[0-9a-fA-F]{24}$/.test(s);
        const anyKeyIsId = Object.keys(rawCounts).some((k) => looksLikeObjectId(k));
        if (plansArray.length && anyKeyIsId) {
          const idToNameMap = {};
          plansArray.forEach((p) => {
            if (p._id) idToNameMap[String(p._id)] = p.name || p._id;
            else if (p.id) idToNameMap[String(p.id)] = p.name || p.id;
          });
          const remapped = {};
          Object.entries(rawCounts).forEach(([k, v]) => {
            const name = idToNameMap[k] || k;
            remapped[String(name).toLowerCase()] = (remapped[String(name).toLowerCase()] || 0) + v;
          });
          setPlanCounts(remapped);
        } else {
          setPlanCounts(rawCounts);
        }

        setPaidCount(paidCounter);

        // --- voice count: use backend endpoint (no localStorage) ---
        const fetchVoiceCount = async () => {
          try {
            const vcRes = await fetch(`${API_BASE}/analytics/voice-count`, { signal });
            const vcBody = await safeJson(vcRes);
            if (vcRes.ok && vcBody && typeof vcBody.count === "number") {
              setVoiceCount(vcBody.count);
            } else if (vcRes.ok && vcBody && typeof vcBody.today === "number") {
              setVoiceCount(vcBody.today);
            } else {
              // fallback to 0 if server returns unexpected shape
              setVoiceCount(0);
            }
          } catch (err) {
            console.error("voice-count fetch failed:", err);
            setVoiceCount(0);
          }
        };

        // initial fetch
        await fetchVoiceCount();
        // refresh frequently for "real-time" feel (10s)
        voiceInterval = setInterval(fetchVoiceCount, 10000);
      } catch (e) {
        if (signal.aborted) return;
        console.error("Dashboard load error:", e);
        setErrorMsg(typeof e === "string" ? e : e.message ?? "Failed to load data");
        setPlanCounts({});
        setPaidCount(0);
        setVoiceCount(0);
        if (!totalUsers) setTotalUsers(0);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    load();

    return () => {
      controller.abort();
      if (voiceInterval) clearInterval(voiceInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderPlanCounts(counts) {
    if (!counts || Object.keys(counts).length === 0) return "No plan info found";
    const order = ["pro", "premium", "paid", "free"];
    const parts = [];
    order.forEach((k) => {
      if (counts[k]) parts.push(`${capitalize(k)}: ${counts[k]}`);
    });
    Object.keys(counts)
      .filter((k) => !order.includes(k))
      .forEach((k) => parts.push(`${capitalize(k)}: ${counts[k]}`));
    return parts.join(" / ");
  }

  function capitalize(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  const chartWrapperStyle = { minHeight: 260 };

  return (
    <main className="w-full min-h-screen p-6 bg-gradient-to-br from-gray-50 to-purple-50 text-gray-800">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Admin Dashboard 👋
        </h1>
        <p className="text-gray-500 mt-1">System analytics & insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          {
            icon: <Users className="text-purple-600" size={28} />,
            label: "Total Users",
            value: loading ? "Loading..." : errorMsg ? "Error" : totalUsers,
            sub: errorMsg,
            clickable: true,
            to: "/admin/users",
          },
          {
            icon: <Mic className="text-pink-600" size={28} />,
            label: "Voice Inputs Today",
            value: loading ? "Loading..." : voiceCount ?? 0,
            sub: !loading && (voiceCount === 0 || voiceCount === null) ? "No voice inputs today" : null,
            clickable: true,
            to: "/admin/voice-logs",
          },
          {
            icon: <Server className="text-indigo-600" size={28} />,
            label: "Paid Users",
            value: loading ? "Loading..." : paidCount,
            clickable: true,
            to: "/admin/plan-users",
          },
          {
            icon: <Activity className="text-emerald-600" size={28} />,
            label: "Success Rate",
            value: "96%",
          },
        ].map((item, i) => (
          <div
            key={i}
            onClick={() => item.clickable && navigate(item.to)}
            className={`bg-white p-5 rounded-2xl shadow-sm border ${item.clickable ? "cursor-pointer hover:shadow-md transform hover:-translate-y-0.5 transition" : ""}`}
            role={item.clickable ? "link" : undefined}
            tabIndex={item.clickable ? 0 : undefined}
            onKeyDown={(e) => {
              if (item.clickable && (e.key === "Enter" || e.key === " ")) navigate(item.to);
            }}
            aria-label={item.clickable ? `${item.label} — click to view details` : item.label}
          >
            <div className="flex justify-between items-center mb-2">
              {item.icon}
              <ArrowUpRight className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500">{item.label}</p>
            <h3 className="text-2xl font-bold break-words">{item.value}</h3>
            {item.sub && <p className="text-xs mt-1 text-red-500">{item.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm" style={chartWrapperStyle}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mic className="text-pink-500" /> Voice Usage This Week
          </h2>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm" style={chartWrapperStyle}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe2 className="text-purple-500" /> Language Distribution
          </h2>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={languageData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                  {languageData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}

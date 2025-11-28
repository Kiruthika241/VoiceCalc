// src/admin/PlanUsersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Download, ChevronDown, ChevronUp } from "lucide-react";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PlanUsersPage() {
  const navigate = useNavigate();

  // data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groups, setGroups] = useState({}); // grouped by planName (non-free only)
  const [total, setTotal] = useState(0); // count of non-free users
  const [usersArray, setUsersArray] = useState([]);
  const [plansArray, setPlansArray] = useState([]);

  // UI state
  const [query, setQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All");
  const [collapsed, setCollapsed] = useState({});
  const [showOnlyPaid, setShowOnlyPaid] = useState(false); // optional toggle in UI

  // debug (kept for dev use)
  const [debug, setDebug] = useState({ usersRes: null, plansRes: null });

  async function safeText(res) {
    try {
      const t = await res.text();
      try {
        return JSON.parse(t);
      } catch {
        return t;
      }
    } catch (e) {
      return `failed to read body: ${String(e)}`;
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setGroups({});
      setTotal(0);
      setUsersArray([]);
      setPlansArray([]);
      setDebug({ usersRes: null, plansRes: null });

      try {
        // fetch users
        const usersRes = await fetch(`${API_BASE}/auth/users`);
        const usersBody = await safeText(usersRes);
        if (!usersRes.ok) {
          throw new Error(`GET /auth/users failed (${usersRes.status}): ${JSON.stringify(usersBody)}`);
        }
        const uArr = Array.isArray(usersBody)
          ? usersBody
          : Array.isArray(usersBody?.users)
          ? usersBody.users
          : [];
        setUsersArray(uArr);

        // fetch plans
        let pArr = [];
        try {
          const plansRes = await fetch(`${API_BASE}/plans`);
          const plansBody = await safeText(plansRes);
          if (plansRes.ok) {
            pArr = Array.isArray(plansBody) ? plansBody : Array.isArray(plansBody?.plans) ? plansBody.plans : [];
          } else {
            pArr = [];
          }
        } catch (e) {
          pArr = [];
        }
        setPlansArray(pArr);

        // Build id -> name map
        const idToName = {};
        pArr.forEach((p) => {
          if (p._id) idToName[String(p._id)] = p.name || p._id;
          else if (p.id) idToName[String(p.id)] = p.name || p.id;
        });

        // Normalize users with a planName and paymentVerified flag
        const normalizedUsers = uArr.map((u) => {
          // determine plan field (could be string name, id, or object)
          const planField = (u && (u.plan || u.subscription || u.accountPlan || u.role)) || "free";
          let planKey = planField;

          if (typeof planField === "object" && planField !== null) {
            planKey = planField.name || planField._id || planField.id || "free";
          }

          planKey = String(planKey || "free");

          // map id to name if possible
          if (idToName[planKey]) planKey = idToName[planKey];

          const planName = (planKey || "free").toString().trim() || "Free";

          // detect payment verified flags (support common variants)
          const paymentVerified =
            Boolean(u.paymentVerified) ||
            Boolean(u.isPaid) ||
            Boolean(u.paid) ||
            Boolean(u.payment_status === "verified") ||
            Boolean(u.subscription?.paymentVerified) ||
            Boolean(u.subscription?.isPaid);

          // also treat non-free as potentially paid (but we still require paymentVerified when toggled)
          const isFree = planName.toLowerCase() === "free";

          return {
            ...u,
            planName: capitalize(planName),
            paymentVerified,
            isFree,
          };
        });

        // **Filter out free users entirely** (user requested removal of free users)
        const paidOrNonFreeUsers = normalizedUsers.filter((u) => !u.isFree);

        // Group non-free users by planName
        const g = {};
        paidOrNonFreeUsers.forEach((u) => {
          const label = u.planName || "Unknown Plan";
          if (!g[label]) g[label] = [];
          g[label].push(u);
        });

        // If groups is empty and we have paid/non-free users, put them under "Unknown Plan"
        if (Object.keys(g).length === 0 && paidOrNonFreeUsers.length) {
          g["Unknown Plan"] = paidOrNonFreeUsers;
        }

        setGroups(g);
        setTotal(paidOrNonFreeUsers.length);

        setDebug({
          usersRes: { count: paidOrNonFreeUsers.length },
          plansRes: { count: pArr.length },
        });
      } catch (e) {
        console.error("PlanUsersPage load error:", e);
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function capitalize(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Derived plan list (exclude "Free")
  const planList = useMemo(() => ["All", "Paid", ...Object.keys(groups)], [groups]);

  // Filter logic - includes showOnlyPaid toggle
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();

    const out = {};

    Object.entries(groups).forEach(([plan, users]) => {
      let filtered = users;

      // Dropdown filter logic
      if (selectedPlan === "Paid") {
        filtered = filtered.filter((u) => typeof u.paymentVerified === "boolean" ? u.paymentVerified : true);
      } else if (selectedPlan !== "All" && selectedPlan !== plan) {
        return;
      }

      // Search filter
      if (q) {
        filtered = filtered.filter((u) => {
          const hay = `${u.name || ""} ${u.email || ""} ${u.phone || ""} ${u.planName || ""}`.toLowerCase();
          return hay.includes(q);
        });
      }

      // showOnlyPaid global toggle (applies on top of other filters)
      if (showOnlyPaid) {
        filtered = filtered.filter((u) => (typeof u.paymentVerified === "boolean" ? u.paymentVerified : true));
      }

      if (filtered.length) out[plan] = filtered;
    });

    return out;
  }, [groups, query, selectedPlan, showOnlyPaid]);

  function downloadCSV() {
    const rows = [];
    rows.push(["Plan", "Name", "Email", "Phone", "Joined", "PaymentVerified"].join(","));
    Object.entries(filteredGroups).forEach(([plan, users]) => {
      users.forEach((u) => {
        const joined = u.createdAt ? new Date(u.createdAt).toISOString() : "";
        const safe = (v) => `"${String(v || "").replace(/"/g, '""')}"`;
        rows.push(
          [safe(plan), safe(u.name), safe(u.email), safe(u.phone), safe(joined), safe(Boolean(u.paymentVerified))].join(",")
        );
      });
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">Plan Users</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md"
              title="Export visible users to CSV"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, phone or plan..."
                className="pl-10 pr-3 py-2 w-full rounded-lg border bg-white"
              />
            </div>

            <div className="w-full md:w-56">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="py-2 px-3 w-full rounded-lg border bg-white"
              >
                {/* Keep these stable entries first */}
                <option value="All">All Users</option>
                <option value="Paid">Paid Users</option>

                {/* dynamic plans (non-free only) */}
                {Object.keys(groups).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={showOnlyPaid} onChange={(e) => setShowOnlyPaid(e.target.checked)} />
                <span className="text-sm text-gray-600">Show only paid/verified</span>
              </label>
            </div>
          </div>
        </div>

        {error && <div className="text-red-700 bg-red-50 px-3 py-2 rounded mb-4">{error}</div>}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plan chips */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => setSelectedPlan("All")}
                className={`px-4 py-2 rounded-xl border ${selectedPlan === "All" ? "bg-purple-600 text-white" : "bg-white"}`}
              >
                All ({total})
              </button>

              <button
                onClick={() => setSelectedPlan("Paid")}
                className={`px-4 py-2 rounded-xl border ${selectedPlan === "Paid" ? "bg-purple-600 text-white" : "bg-white"}`}
              >
                Paid Users
              </button>

              {/* dynamic plans */}
              {Object.entries(groups).map(([plan, users]) => {
                return (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`px-4 py-2 rounded-xl border ${selectedPlan === plan ? "bg-purple-600 text-white" : "bg-white"}`}
                  >
                    {plan} ({users.length})
                  </button>
                );
              })}
            </div>

            {Object.entries(filteredGroups).length === 0 && (
              <div className="text-gray-500 flex items-center gap-3">
                <div>No users match your filters.</div>
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedPlan("All");
                    setShowOnlyPaid(false);
                  }}
                  className="text-sm underline"
                >
                  Reset filters
                </button>
              </div>
            )}

            {Object.entries(filteredGroups).map(([plan, users]) => (
              <div key={plan} className="bg-white p-4 rounded-2xl shadow-sm border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{plan}</h3>
                    <p className="text-xs text-gray-500">{users.length} users</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCollapsed((c) => ({ ...c, [plan]: !c[plan] }))}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border"
                    >
                      {collapsed[plan] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      <span className="text-sm">{collapsed[plan] ? "Expand" : "Collapse"}</span>
                    </button>
                  </div>
                </div>

                {!collapsed[plan] && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-gray-500">
                        <tr>
                          <th className="pb-2 w-12">#</th>
                          <th className="pb-2">Name</th>
                          <th className="pb-2">Email</th>
                          <th className="pb-2">Phone</th>
                          <th className="pb-2">Plan</th>
                          <th className="pb-2">Paid?</th>
                          <th className="pb-2">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <tr key={u._id || u.id || i} className="border-t hover:bg-gray-50 transition">
                            <td className="py-3 align-top">{i + 1}</td>
                            <td className="py-3 font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                                  {(u.name || "").charAt(0).toUpperCase() || "?"}
                                </div>
                                <div>
                                  <div>{u.name || "—"}</div>
                                  <div className="text-xs text-gray-400">{u._id || u.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">{u.email || "—"}</td>
                            <td className="py-3">{u.phone || "—"}</td>
                            <td className="py-3">{u.planName || "—"}</td>
                            <td className="py-3">
                              {typeof u.paymentVerified === "boolean"
                                ? u.paymentVerified
                                  ? "Yes"
                                  : "No"
                                : "Unknown"}
                            </td>
                            <td className="py-3">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* If empty results (no non-free users) */}
        {!loading && !error && total === 0 && (
          <div className="text-gray-500 mt-6">No paid/non-free users found. Check <code>/api/auth/users</code> or add paid users.</div>
        )}

        {/* dev debug (hidden by default) */}
        {/* <pre className="mt-6 text-xs text-gray-400">{JSON.stringify(debug, null, 2)}</pre> */}
      </div>
    </div>
  );
}

// src/pages/PlansPage.jsx
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, CheckCircle2, X } from "lucide-react";

const API_BASE = "http://localhost:5000/api"; // change if needed

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false); // add/edit modal
  const [viewPlan, setViewPlan] = useState(null); // 👈 NEW: view modal
  const [error, setError] = useState("");
  const [editingPlan, setEditingPlan] = useState(null); // null = add mode

  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    features: "",
    status: "Active",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ---------------- FETCH ALL PLANS ----------------
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/plans`);
      const data = await res.json();

      if (!res.ok) {
        console.error("GET /plans error:", data);
        setError(data.message || "Failed to fetch plans");
        return;
      }

      setPlans(data);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // ---------------- RESET FORM ----------------
  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      duration: "",
      features: "",
      status: "Active",
    });
  };

  // ---------------- OPEN ADD MODAL ----------------
  const openAddModal = () => {
    setEditingPlan(null);
    resetForm();
    setOpenModal(true);
  };

  // ---------------- OPEN EDIT MODAL ----------------
  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name || "",
      price: plan.price || "",
      duration: plan.duration || "",
      features: (plan.features || []).join(", "),
      status: plan.status || "Active",
    });
    setOpenModal(true);
  };

  // ---------------- OPEN VIEW MODAL ----------------
  const openViewModal = (plan) => {
    setViewPlan(plan);
  };

  const closeViewModal = () => {
    setViewPlan(null);
  };

  // ---------------- ADD PLAN ----------------
  const addPlan = async () => {
    setError("");

    if (!form.name || !form.price || !form.duration) {
      alert("Please fill name, price and duration");
      return;
    }

    const newPlan = {
      name: form.name,
      price: form.price,
      duration: form.duration,
      features: form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      status: form.status,
    };

    try {
      const res = await fetch(`${API_BASE}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan),
      });

      const saved = await res.json();

      if (!res.ok) {
        setError(saved.message || "Error saving plan");
        alert("Server error: " + (saved.message || "Failed to save plan"));
        return;
      }

      await fetchPlans();
      setOpenModal(false);
      resetForm();
      alert("Plan added successfully ✅");
    } catch (err) {
      console.error("Failed to add plan:", err);
      setError("Could not connect to server");
      alert("Could not connect to server");
    }
  };

  // ---------------- UPDATE PLAN ----------------
  const updatePlan = async () => {
    if (!editingPlan) return;
    setError("");

    if (!form.name || !form.price || !form.duration) {
      alert("Please fill name, price and duration");
      return;
    }

    const updated = {
      name: form.name,
      price: form.price,
      duration: form.duration,
      features: form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      status: form.status,
    };

    try {
      const res = await fetch(`${API_BASE}/plans/${editingPlan._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      const saved = await res.json();

      if (!res.ok) {
        console.error("PUT /plans error:", saved);
        setError(saved.message || "Error updating plan");
        alert("Server error: " + (saved.message || "Failed to update plan"));
        return;
      }

      await fetchPlans();
      setOpenModal(false);
      setEditingPlan(null);
      resetForm();
      alert("Plan updated successfully ✏️");
    } catch (err) {
      console.error("Failed to update plan:", err);
      setError("Could not connect to server");
      alert("Could not connect to server");
    }
  };

  // ---------------- DELETE PLAN ----------------
  const deletePlan = async (plan) => {
    if (!window.confirm(`Delete plan "${plan.name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/plans/${plan._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("DELETE /plans error:", data);
        alert(data.message || "Failed to delete plan");
        return;
      }

      setPlans((prev) => prev.filter((p) => p._id !== plan._id));
      alert("Plan deleted successfully 🗑");
    } catch (err) {
      console.error("Failed to delete plan:", err);
      alert("Could not connect to server");
    }
  };

  // ---------------- SUBMIT HANDLER (ADD/EDIT) ----------------
  const handleSubmit = () => {
    if (editingPlan) {
      updatePlan();
    } else {
      addPlan();
    }
  };

  return (
    <div className="w-full min-h-screen text-gray-800 overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
            Plans
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your pricing plans</p>
        </div>

        <button
          onClick={openAddModal}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition shadow-md"
        >
          <Plus size={18} /> Add Plan
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* LOADING */}
      {loading && <p className="text-gray-500">Loading plans...</p>}

      {/* PLAN CARDS GRID */}
      {!loading && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
          {plans.map((plan) => (
            <div
              key={plan._id || plan.id}
              className="relative bg-white border rounded-2xl shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Floating Plan Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-bl-xl shadow">
                ID: {(plan._id || String(plan.id)).slice(-5)}
              </div>

              {/* Plan Header */}
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold ${
                    plan.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {plan.status}
                </span>
              </div>

              <p className="text-3xl font-bold text-purple-600">
                {plan.price}
              </p>
              <p className="text-sm text-gray-600 mb-3">{plan.duration}</p>

              <h3 className="font-semibold mt-4 mb-2 text-gray-700">
                Features:
              </h3>

              <ul className="space-y-2 text-sm">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex gap-2 items-center">
                    <CheckCircle2 className="text-purple-600" size={18} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* ACTIONS */}
              <div className="flex gap-6 mt-6 text-gray-600">
                <Eye
                  size={20}
                  className="cursor-pointer hover:text-purple-600"
                  onClick={() => openViewModal(plan)} // 👈 now working
                />
                <Edit
                  size={20}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => openEditModal(plan)}
                />
                <Trash2
                  size={20}
                  className="cursor-pointer hover:text-red-600"
                  onClick={() => deletePlan(plan)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !plans.length && !error && (
        <p className="text-gray-500">No plans found. Add one to get started.</p>
      )}

      {/* ADD / EDIT MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full sm:w-[480px] rounded-2xl p-6 shadow-xl relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => {
                setOpenModal(false);
                setEditingPlan(null);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-extrabold mb-5 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              {editingPlan ? "Edit Plan" : "Add New Plan"}
            </h2>

            {/* FORM */}
            <div className="space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Plan Name"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price (₹)"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="Duration"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />

              <textarea
                name="features"
                value={form.features}
                onChange={handleChange}
                placeholder="Features (comma separated)"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              ></textarea>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* BUTTONS */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setOpenModal(false);
                  setEditingPlan(null);
                  resetForm();
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md transition"
              >
                {editingPlan ? "Save Changes" : "Add Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL (READ-ONLY) */}
      {viewPlan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full sm:w-[480px] rounded-2xl p-6 shadow-xl relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={closeViewModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-extrabold mb-5 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              View Plan
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-semibold">{viewPlan.name}</p>
              </div>

              <div>
                <p className="text-gray-500">Price</p>
                <p className="font-semibold">{viewPlan.price}</p>
              </div>

              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-semibold">{viewPlan.duration}</p>
              </div>

              <div>
                <p className="text-gray-500">Status</p>
                <p
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    viewPlan.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {viewPlan.status}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Features</p>
                <ul className="list-disc list-inside space-y-1">
                  {viewPlan.features?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

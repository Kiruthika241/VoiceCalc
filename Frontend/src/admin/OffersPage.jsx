import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, Tag, Calendar, Percent, X } from "lucide-react";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    code: "",
    price: "",
    discount: "",
    duration: "",
    status: "Active",
  });

  // Fetch offers from backend
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API_BASE}/offers`);
        const data = await res.json();
        setOffers(data || []);
      } catch (err) {
        console.error("Error fetching offers:", err);
      }
    };

    fetchOffers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      code: "",
      price: "",
      discount: "",
      duration: "",
      status: "Active",
    });
  };

  const handleAddOffer = async () => {
    try {
      const body = {
        title: form.title,
        description: form.description,
        code: form.code,
        price: Number(form.price),
        discount: Number(form.discount),
        duration: Number(form.duration),
        status: form.status,
      };

      const res = await fetch(`${API_BASE}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error creating offer");
        return;
      }

      // add new offer to top
      setOffers((prev) => [data, ...prev]);
      setOpenModal(false);
      resetForm();
    } catch (err) {
      console.error("Error adding offer:", err);
      alert("Something went wrong while adding offer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this offer?")) return;

    try {
      const res = await fetch(`${API_BASE}/offers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error deleting offer");
        return;
      }

      setOffers((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Error deleting offer:", err);
      alert("Something went wrong while deleting offer");
    }
  };

  return (
    <div className="w-full min-h-screen text-gray-800 overflow-x-hidden">
      {/* ------------------ HEADER ------------------ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
            Offers
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Create and manage exclusive offers
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition shadow-md"
        >
          <Plus size={18} /> Add Offer
        </button>
      </div>

      {/* ------------------ OFFERS GRID ------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
        {offers.map((offer, index) => (
          <div
            key={offer._id}
            className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            {/* Floating Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-bl-xl shadow">
              #{index + 1}
            </div>

            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-gray-900">{offer.title}</h2>

              {offer.status === "Active" ? (
                <span className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full font-semibold">
                  Inactive
                </span>
              )}
            </div>

            <p className="text-xs mt-1 text-pink-600 font-semibold">
              Code: {offer.code}
            </p>

            <p className="text-gray-600 text-sm mt-2">{offer.description}</p>

            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <Tag className="text-purple-600" size={18} />
                <span className="font-medium">Price:</span> ₹{offer.price}
              </p>

              <p className="flex items-center gap-2">
                <Percent className="text-pink-600" size={18} />
                <span className="font-medium">Discount:</span> {offer.discount}%
              </p>

              <p className="flex items-center gap-2">
                <Calendar className="text-indigo-600" size={18} />
                <span className="font-medium">Duration:</span> {offer.duration} Days
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-6 mt-5 text-gray-600">
              <Eye
                size={20}
                className="cursor-pointer hover:text-purple-600 transition"
                onClick={() =>
                  alert(
                    `Offer Code: ${offer.code}\nDiscount: ${offer.discount}%\nUse this code in payment page.`
                  )
                }
              />
              <Edit
                size={20}
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() =>
                  alert("Edit functionality can be added later if needed.")
                }
              />
              <Trash2
                size={20}
                className="cursor-pointer hover:text-red-600 transition"
                onClick={() => handleDelete(offer._id)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ------------------ ADD OFFER MODAL ------------------ */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full sm:w-[500px] rounded-2xl shadow-xl p-6 animate-fadeIn relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setOpenModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-extrabold mb-5 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              Add New Offer
            </h2>

            {/* FORM FIELDS */}
            <div className="space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Offer Title"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Offer Code (ex: EZY149)"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 uppercase"
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Offer Description"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              ></textarea>

              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Display Price (₹)"
                type="number"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                name="discount"
                value={form.discount}
                onChange={handleChange}
                placeholder="Discount (%)"
                type="number"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="Duration (Days)"
                type="number"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />

              {/* STATUS */}
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
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleAddOffer}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md transition"
              >
                Add Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Plus, Edit, Trash2, ShieldCheck, CheckCircle2, X } from "lucide-react";

export default function AdminRolesPage() {
  // Default Roles
  const defaultRoles = [
    {
      id: 1,
      name: "Super Admin",
      permissions: [
        "Manage Users", "Manage Plans", "Manage Offers",
        "Transactions", "All Access"
      ],
      status: "Active",
    },
    {
      id: 2,
      name: "Moderator",
      permissions: ["Manage Users", "View Transactions", "Edit Content"],
      status: "Active",
    },
    {
      id: 3,
      name: "Support",
      permissions: ["View Users", "View Plans", "View Offers", "Reply Tickets"],
      status: "Active",
    },
    {
      id: 4,
      name: "Viewer",
      permissions: ["View Dashboard", "View Users", "View Plans"],
      status: "Inactive",
    },
  ];

  const [roles, setRoles] = useState(defaultRoles);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    permissions: "",
    status: "Active",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addRole = () => {
    const newRole = {
      id: roles.length + 1,
      name: form.name,
      permissions: form.permissions.split(",").map((p) => p.trim()),
      status: form.status,
    };

    setRoles([newRole, ...roles]);
    setOpenModal(false);

    setForm({
      name: "",
      permissions: "",
      status: "Active",
    });
  };

  return (
    <div className="w-full min-h-screen text-gray-800 overflow-x-hidden">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
            Admin Roles
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage access control & permissions</p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition shadow-md"
        >
          <Plus size={18} /> Add Role
        </button>
      </div>

      {/* ROLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
        {roles.map((role) => (
          <div
            key={role.id}
            className="relative bg-white rounded-2xl border shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Floating Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-bl-xl shadow">
              ID: {role.id}
            </div>

            {/* Title */}
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShieldCheck className="text-purple-600" size={22} />
                {role.name}
              </h2>

              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold ${
                  role.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {role.status}
              </span>
            </div>

            {/* Permissions */}
            <h3 className="font-semibold mt-3 mb-2 text-gray-700">Permissions:</h3>

            <ul className="text-sm space-y-2">
              {role.permissions.map((perm, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="text-purple-600" size={18} />
                  {perm}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex gap-6 mt-6 text-gray-600">
              <Edit size={20} className="cursor-pointer hover:text-blue-600 transition" />
              <Trash2 size={20} className="cursor-pointer hover:text-red-600 transition" />
            </div>
          </div>
        ))}
      </div>

      {/* ADD ROLE MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full sm:w-[480px] rounded-2xl p-6 shadow-xl relative animate-fadeIn">

            {/* Close */}
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-extrabold mb-5 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              Add New Role
            </h2>

            {/* FORM */}
            <div className="space-y-4">
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Role Name"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />

              <textarea
                name="permissions"
                value={form.permissions}
                onChange={handleChange}
                placeholder="Permissions (comma separated)"
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
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={addRole}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md transition"
              >
                Add Role
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

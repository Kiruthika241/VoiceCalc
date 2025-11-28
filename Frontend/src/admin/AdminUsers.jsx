// src/pages/UsersPage.jsx
import { useState, useEffect, useMemo } from "react";
import { Search, Edit, Trash2, Eye, X, Plus, Download } from "lucide-react";

function highlight(text, query) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i}>{part}</mark>
    ) : (
      part
    )
  );
}

const USERS_PER_PAGE_OPTIONS = [10, 30, 50, 100];
const API_BASE_URL = "http://localhost:5000/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(30);
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Popups state
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // NOTE: no Authorization header sent (public / unauthenticated request)
        const res = await fetch(`${API_BASE_URL}/auth/users`);
        const data = await res.json();

        // if backend returns an error shape, handle it
        if (!res.ok) {
          throw new Error(data.message || "Failed to load users");
        }

        const mapped = (data.users || []).map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          city: u.location,
          status: u.status || "Active",
          joined: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString()
            : "",
        }));
        setUsers(mapped);
        setFilteredUsers(mapped);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debounced Search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const term = debouncedSearch.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.phone.includes(term) ||
          u.city.toLowerCase().includes(term)
      )
    );
    setPage(1);
    setSelectedUsers([]);
  }, [debouncedSearch, users]);

  // Sorting logic
  const sortedUsers = useMemo(() => {
    const arr = [...filteredUsers];
    arr.sort((a, b) => {
      const valueA = a[sortKey]?.toString().toLowerCase() || "";
      const valueB = b[sortKey]?.toString().toLowerCase() || "";
      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filteredUsers, sortKey, sortOrder]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / usersPerPage));
  const start = (page - 1) * usersPerPage;
  const paginated = sortedUsers.slice(start, start + usersPerPage);

  // keep page valid after changes
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  // Table select logic
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(paginated.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id, checked) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, id] : prev.filter((uid) => uid !== id)
    );
  };

  const allSelected =
    paginated.length > 0 && paginated.every((u) => selectedUsers.includes(u.id));

  // Table sort UI
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const rows = [
      ["Name", "Email", "Phone", "Role", "Location", "Status", "Joined"],
      ...sortedUsers.map((u) => [
        u.name,
        u.email,
        u.phone,
        u.role,
        u.city,
        u.status,
        u.joined,
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "users.csv";
    link.click();
  };

  // CRUD popup handlers
  const openEdit = (user) => {
    setEditingUser({ ...user });
    setEditPopupOpen(true);
  };

  const openAdd = () => {
    setEditingUser({
      name: "",
      email: "",
      phone: "",
      city: "",
      role: "user",
      status: "Active",
    });
    setAddPopupOpen(true);
  };

  const openDetail = (user) => {
    setDetailUser(user);
    setDetailPopupOpen(true);
  };

  const openDelete = (id) => {
    setDeleteUserId(id);
    setDeletePopupOpen(true);
  };

  // Save Edit/Add (no auth header)
  const saveEdit = async (type = "edit") => {
    try {
      const url =
        type === "edit"
          ? `${API_BASE_URL}/auth/users/${editingUser.id}`
          : `${API_BASE_URL}/auth/users`;
      const method = type === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      if (type === "edit") {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? editingUser : u))
        );
        setFilteredUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? editingUser : u))
        );
      } else {
        const newUser = {
          ...editingUser,
          id: data.newUser?._id || Date.now().toString(),
          joined: data.newUser?.createdAt
            ? new Date(data.newUser.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString(),
        };
        setUsers((prev) => [...prev, newUser]);
        setFilteredUsers((prev) => [...prev, newUser]);
      }

      setEditPopupOpen(false);
      setAddPopupOpen(false);
    } catch (err) {
      alert((err && err.message) || "Update failed");
    }
  };

  // Confirm Delete (single or bulk) - no auth header
  const confirmDelete = async (ids) => {
    try {
      const idsToDelete = ids || [deleteUserId];

      for (const id of idsToDelete) {
        const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error("Delete failed for id:", id, data.message);
        }
      }

      setUsers((prev) => prev.filter((u) => !idsToDelete.includes(u.id)));
      setFilteredUsers((prev) =>
        prev.filter((u) => !idsToDelete.includes(u.id))
      );

      setDeletePopupOpen(false);
      setSelectedUsers([]);
    } catch (err) {
      alert("Delete failed: " + (err.message || ""));
    }
  };

  // Loader & Error
  if (loading)
    return <div className="text-center mt-20 text-gray-600">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-red-600 mt-20">
        Failed: {error}
      </div>
    );

  // Table headers
  const headers = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
    { key: "city", label: "Location" },
    { key: "status", label: "Status" },
    { key: "joined", label: "Joined" },
  ];

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50">
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
        <h1 className="text-3xl font-bold text-purple-600">Users</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            className="flex gap-1 items-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
            onClick={openAdd}
          >
            <Plus size={18} /> Add User
          </button>
          <button
            className="flex gap-1 items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
            onClick={exportCSV}
          >
            <Download size={18} /> Export CSV
          </button>
          {selectedUsers.length > 0 && (
            <button
              className="flex gap-1 items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
              onClick={() => confirmDelete(selectedUsers)}
            >
              <Trash2 size={17} /> Delete ({selectedUsers.length})
            </button>
          )}

          <div className="relative ml-3">
            <input
              className="px-4 py-2 border rounded-xl shadow w-56"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute top-3 right-3 text-gray-500" size={18} />
          </div>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={usersPerPage}
            onChange={(e) => {
              setUsersPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border px-2 py-1 rounded"
          >
            {USERS_PER_PAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-2"
          >
            {"<<"}
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2"
          >
            {"<"}
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2"
          >
            {">"}
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-2"
          >
            {">>"}
          </button>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl border shadow mb-10">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase select-none">
            <tr>
              <th className="px-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              {headers.map((h) => (
                <th
                  key={h.key}
                  className="py-3 px-4 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort(h.key)}
                >
                  {h.label}
                  {sortKey === h.key && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50 group">
                <td className="px-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) =>
                      handleSelectUser(user.id, e.target.checked)
                    }
                  />
                </td>
                {headers.map((h) => (
                  <td key={h.key} className="py-3 px-4">
                    {searchTerm && ["name", "email", "city"].includes(h.key)
                      ? highlight(user[h.key], searchTerm)
                      : user[h.key]}
                  </td>
                ))}
                <td className="py-3 px-4 text-center flex gap-2 justify-center">
                  <Eye
                    className="text-purple-600 cursor-pointer"
                    size={19}
                    onClick={() => openDetail(user)}
                  />
                  <Edit
                    className="text-blue-600 cursor-pointer"
                    size={19}
                    onClick={() => openEdit(user)}
                  />
                  <Trash2
                    className="text-red-600 cursor-pointer"
                    size={19}
                    onClick={() => openDelete(user.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="text-center py-5 text-gray-400">No users found.</div>
        )}
      </div>

      {/* ADD & EDIT POPUP */}
      {(editPopupOpen || addPopupOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 w-96 rounded-xl shadow-xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {addPopupOpen ? "Add User" : "Edit User"}
              </h2>
              <X
                className="cursor-pointer"
                onClick={() => {
                  setEditPopupOpen(false);
                  setAddPopupOpen(false);
                }}
              />
            </div>
            <input
              className="w-full mb-3 px-3 py-2 border rounded"
              placeholder="Name"
              value={editingUser?.name || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
            />
            {addPopupOpen && (
              <input
                className="w-full mb-3 px-3 py-2 border rounded"
                placeholder="Email"
                value={editingUser?.email || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
              />
            )}
            <input
              className="w-full mb-3 px-3 py-2 border rounded"
              placeholder="Phone"
              value={editingUser?.phone || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, phone: e.target.value })
              }
            />
            <input
              className="w-full mb-3 px-3 py-2 border rounded"
              placeholder="Location"
              value={editingUser?.city || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, city: e.target.value })
              }
            />
            <div className="mb-3">
              <label className="block mb-1">Role:</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={editingUser?.role || "user"}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1">Status:</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={editingUser?.status || "Active"}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, status: e.target.value })
                }
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
            <button
              className="w-full py-2 bg-purple-600 text-white rounded-lg"
              onClick={() => saveEdit(addPopupOpen ? "add" : "edit")}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* DETAIL POPUP */}
      {detailPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 w-96 rounded-xl shadow-xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <X
                className="cursor-pointer"
                onClick={() => setDetailPopupOpen(false)}
              />
            </div>
            <div className="mb-3 flex items-center gap-3">
              <div className="w-12 h-12 mb-1 rounded-full bg-purple-600 text-white text-2xl flex items-center justify-center font-semibold">
                {detailUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">{detailUser?.name}</div>
                <div className="text-gray-500 text-sm">{detailUser?.email}</div>
              </div>
            </div>
            <div className="mb-2">
              <span className="font-medium">Phone: </span> {detailUser?.phone}
            </div>
            <div className="mb-2">
              <span className="font-medium">Role: </span> {detailUser?.role}
            </div>
            <div className="mb-2">
              <span className="font-medium">Location: </span> {detailUser?.city}
            </div>
            <div className="mb-2">
              <span className="font-medium">Status: </span> {detailUser?.status}
            </div>
            <div className="mb-2">
              <span className="font-medium">Joined: </span> {detailUser?.joined}
            </div>
          </div>
        </div>
      )}

      {/* DELETE POPUP */}
      {deletePopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
            <h2 className="text-lg font-bold mb-4">Delete User?</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this user?
            </p>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 rounded bg-gray-300"
                onClick={() => setDeletePopupOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white"
                onClick={() => confirmDelete()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

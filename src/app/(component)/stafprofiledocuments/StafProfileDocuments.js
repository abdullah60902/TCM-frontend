"use client";
import React, { useEffect, useState } from "react";
import { FaFileAlt, FaUserTie, FaDownload, FaPlus, FaTrashAlt } from "react-icons/fa";
import { MdCreditCard } from "react-icons/md";

const StaffProfileDocuments = ({ staffId }) => {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    expiryDate: "",
    notes: "",
    file: null,
  });

  const categories = [
    "employmentContracts",
    "dbsCertificates",
    "idDocuments",
    "trainingCertificates",
    "appraisalsReviews",
    "disciplinaryRecords",
  ];

  // ============================
  // FETCH DOCUMENTS
  // ============================
  useEffect(() => {
    if (!staffId) return;

    fetch(`https://admin-panel-backend-alpha.vercel.app/staff-documents/staff/${staffId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
.then((data) => {
  console.log("DOCUMENT RESPONSE =>", data);
  setDocuments(data);
});
  }, [staffId]);

  // ============================
  // HANDLE FILE UPLOAD
  // ============================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.file) {
      alert("Please select category and upload a file");
      return;
    }

    let fd = new FormData();
    fd.append("staffName", staffId);
    fd.append("expiryDate", formData.expiryDate);
    fd.append("notes", formData.notes);
    fd.append(formData.category, formData.file);

    const res = await fetch("https://admin-panel-backend-alpha.vercel.app/staff-documents", {
      method: "POST",
      body: fd,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const result = await res.json();
    alert(result.message);

    setShowForm(false);
    setFormData({ category: "", expiryDate: "", notes: "", file: null });

    // refresh data
    fetch(`https://admin-panel-backend-alpha.vercel.app/staff-documents/staff/${staffId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setDocuments(data));
  };

  // ============================
  // DELETE DOCUMENT
  // ============================
  const deleteDoc = async (id) => {
    if (!confirm("Delete this document?")) return;

    await fetch(`https://admin-panel-backend-alpha.vercel.app/staff-documents/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    setDocuments(documents.filter((d) => d._id !== id));
  };

  return (
    <div className="bg-[#243041] rounded-lg shadow p-4 text-white">
      <h2 className="text-lg font-semibold mb-4">🗂️ Staff Documents</h2>

      {/* Upload Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-[#4A49B0] px-4 py-2 rounded hover:bg-[#3a3a8c]"
      >
        <FaPlus className="inline mr-1" /> Upload New Document
      </button>

      {/* Upload Form */}
      {showForm && (
        <form onSubmit={handleUpload} className="mt-4 space-y-3">
          <select
            className="p-2 bg-gray-700 w-full rounded"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="p-2 bg-gray-700 w-full rounded"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />

          <textarea
            placeholder="Notes..."
            className="p-2 bg-gray-700 w-full rounded"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <input
            type="file"
            className="p-2 bg-gray-700 w-full rounded"
            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
          />

          <button type="submit" className="bg-green-600 px-4 py-2 rounded">
            Upload
          </button>
        </form>
      )}

      {/* DOCUMENT LIST */}
     {/* DOCUMENT LIST */}
<div className="mt-6">
  {documents.length === 0 ? (
    <p className="text-gray-400">No documents found.</p>
  ) : (
    documents.map((doc) => {
      const today = new Date().toISOString().slice(0, 10);
      const exp = doc.expiryDate?.slice(0, 10);

      let status = "Valid";
      let statusColor = "text-green-400";

      if (exp) {
        if (exp === today) {
          status = "Expiring Today";
          statusColor = "text-yellow-400";
        } else if (exp < today) {
          status = "Expired";
          statusColor = "text-red-500";
        }
      }

      return (
        <div
          key={doc._id}
          className="p-4 mb-4 bg-gray-800 rounded"
        >
          {/* STAFF NAME */}
          <p className="text-lg font-semibold">{doc.staffName?.fullName}</p>

          {/* EXPIRY + STATUS */}
          <p className={`${statusColor} font-bold`}>
            Status: {status}  
            {exp && ` — (${exp})`}
          </p>

          {/* ALL CATEGORY DOCUMENTS */}
          <div className="mt-3 bg-gray-900 p-3 rounded">
            {categories.map((cat) => {
              const catFiles = doc[cat] || [];

              if (catFiles.length === 0) return null;

              return (
                <div key={cat} className="mb-3">
                  {/* CATEGORY TITLE */}
                  <p className="text-gray-300 font-semibold capitalize">
                    {cat.replace(/([A-Z])/g, " $1")}
                  </p>

                  {/* DOWNLOADS */}
                  <div className="flex gap-3 mt-2">
                    {catFiles.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400"
                      >
                        <FaDownload />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DELETE BUTTON */}
          <button
            className="text-red-400 mt-3"
            onClick={() => deleteDoc(doc._id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      );
    })
  )}
</div>
    </div>
  );
};
export default StaffProfileDocuments;

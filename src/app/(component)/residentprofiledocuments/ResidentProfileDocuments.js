"use client";
import React, { useEffect, useState } from "react";
import { FaFileAlt, FaDownload, FaPlus, FaTrashAlt } from "react-icons/fa";

const ResidentProfileDocuments = ({ clientId }) => {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    expiryDate: "",
    notes: "",
    file: null,
  });

  // ============================
  // FETCH DOCUMENTS
  // ============================
  useEffect(() => {
    if (!clientId) return;

    fetch(`https://admin-panel-backend-alpha.vercel.app/resident-documents/client/${clientId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("RESIDENT DOCUMENT RESPONSE =>", data);
        setDocuments(data);
      })
      .catch((err) => {
        console.error("Failed to fetch client documents:", err);
        setDocuments([]);
      });
  }, [clientId]);

  // ============================
  // HANDLE FILE UPLOAD
  // ============================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.file) {
      alert("Please enter a category and upload a file");
      return;
    }

    try {
      let fd = new FormData();
      fd.append("client", clientId);
      fd.append("category", formData.category);
      fd.append("expiryDate", formData.expiryDate);
      fd.append("notes", formData.notes);
      fd.append("file", formData.file);

      const res = await fetch("https://admin-panel-backend-alpha.vercel.app/resident-documents", {
        method: "POST",
        body: fd,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await res.json();
      
      if (res.ok) {
        alert(result.message || "Document uploaded successfully");
        
        setShowForm(false);
        setFormData({ category: "", expiryDate: "", notes: "", file: null });

        // refresh data
        const refreshRes = await fetch(`https://admin-panel-backend-alpha.vercel.app/resident-documents/client/${clientId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        const refreshData = await refreshRes.json();
        console.log("Refreshed documents:", refreshData);
        setDocuments(Array.isArray(refreshData) ? refreshData : []);
      } else {
        alert(result.error || "Failed to upload document");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload document. Please try again.");
    }
  };

  // ============================
  // DELETE DOCUMENT
  // ============================
  const deleteDoc = async (id) => {
    if (!confirm("Delete this document?")) return;

    await fetch(`https://admin-panel-backend-alpha.vercel.app/resident-documents/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    setDocuments(documents.filter((d) => d._id !== id));
  };

  // Group documents by category
  const groupedDocs = Array.isArray(documents) 
    ? documents.reduce((acc, doc) => {
        const cat = doc.category || "Uncategorized";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(doc);
        return acc;
      }, {})
    : {};

  return (
    <div className="bg-[#243041] rounded-lg shadow p-4 text-white">
      <h2 className="text-lg font-semibold mb-4">🗂️ Resident Documents</h2>

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
          <input
            type="text"
            placeholder="Document Category (e.g., Medical Report)"
            className="p-2 bg-gray-700 w-full rounded text-white"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <input
            type="date"
            className="p-2 bg-gray-700 w-full rounded text-white"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />

          <textarea
            placeholder="Notes..."
            className="p-2 bg-gray-700 w-full rounded text-white"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <input
            type="file"
            className="p-2 bg-gray-700 w-full rounded text-white"
            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
          />

          <button type="submit" className="bg-green-600 px-4 py-2 rounded">
            Upload
          </button>
        </form>
      )}

      {/* DOCUMENT LIST */}
      <div className="mt-6">
        {documents.length === 0 ? (
          <p className="text-gray-400">No documents found.</p>
        ) : (
          Object.entries(groupedDocs).map(([category, docs]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2 capitalize">
                {category}
              </h3>
              {docs.map((doc) => {
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
                    className="p-4 mb-3 bg-gray-800 rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="text-white font-semibold">{doc.category}</p>
                      <p className={`${statusColor} text-sm`}>
                        Status: {status} {exp && ` — (${exp})`}
                      </p>
                      {doc.notes && <p className="text-gray-400 text-sm mt-1">{doc.notes}</p>}
                    </div>

                    <div className="flex gap-3">
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <FaDownload />
                        </a>
                      )}
                      <button
                        className="text-red-400 hover:text-red-300"
                        onClick={() => deleteDoc(doc._id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResidentProfileDocuments;

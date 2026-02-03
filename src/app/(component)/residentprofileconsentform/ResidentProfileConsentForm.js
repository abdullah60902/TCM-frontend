"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaTimes,
  FaArchive,
} from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";

const ResidentProfileConsentForm = ({ clientId }) => {
  const [consents, setConsents] = useState([]);
  const [archivedConsents, setArchivedConsents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewConsent, setViewConsent] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const [form, setForm] = useState({
    dolsInPlace: "",
    authorizationEndDate: "",
    conditions: "",
  });

  // ✅ Fetch Active Consent Records
  useEffect(() => {
    if (!clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/consent/client/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setConsents(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching Consent Records:", err));
  }, [clientId]);

  // ✅ Fetch Archived Records (older than 6 months)
  useEffect(() => {
    if (!showArchived || !clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/consent/older-than-six-months`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const clientRecords = (data.records || []).filter(
          (r) => r.client && (r.client._id === clientId || r.client === clientId)
        );
        setArchivedConsents(clientRecords);
      })
      .catch((err) => console.error("Error fetching archived consent records:", err));
  }, [showArchived, clientId]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ dolsInPlace: "", authorizationEndDate: "", conditions: "" });
    setShowForm(false);
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    setForm({
      dolsInPlace: record.dolsInPlace || "",
      authorizationEndDate: record.authorizationEndDate ? record.authorizationEndDate.slice(0, 10) : "",
      conditions: record.conditions || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this Consent/DoLS Record?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/consent/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setConsents((prev) => prev.filter((r) => r._id !== id));
        alert("Record deleted successfully!");
      } else {
        alert("Failed to delete record");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      clientId,
      dolsInPlace: form.dolsInPlace,
      authorizationEndDate: form.authorizationEndDate,
      conditions: form.conditions,
    };

    try {
      if (editingId) {
        // Update
        const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/consent/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updated = await res.json();
          setConsents((prev) => prev.map((r) => (r._id === editingId ? updated : r)));
          alert("Record updated successfully!");
          resetForm();
        } else {
          alert("Failed to update record");
        }
      } else {
        // Create
        const res = await fetch("https://admin-panel-backend-alpha.vercel.app/consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const newItem = await res.json();
          setConsents((prev) => [newItem, ...prev]);
          alert("Record created successfully!");
          resetForm();
        } else {
          alert("Failed to create record");
        }
      }
    } catch (error) {
      console.error("Error saving record:", error);
      alert("An error occurred while saving.");
    }
  };

  const handleDownloadPdf = async (item) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Consent & Legal (DoLS) Details", 14, 15);

    const mainRows = [];
    if (item.dolsInPlace) mainRows.push(["DoLS In Place", item.dolsInPlace]);
    if (item.authorizationEndDate) mainRows.push(["Authorization End Date", new Date(item.authorizationEndDate).toLocaleDateString()]);
    if (item.conditions) mainRows.push(["Conditions", item.conditions]);
    if (item.createdAt) mainRows.push(["Created On", new Date(item.createdAt).toLocaleDateString()]);

    if (mainRows.length) {
      autoTable(doc, {
        startY: 25,
        head: [["Field", "Value"]],
        body: mainRows,
        styles: { cellPadding: 3, fontSize: 10 },
        headStyles: { fillColor: [75, 85, 99] }, // Gray for legal
      });
    }

    const filename = `Consent_DoLS_${item._id}.pdf`;
    doc.save(filename);
  };

  const handleView = (record) => {
    setViewConsent(record);
  };

  const closeView = () => setViewConsent(null);

  return (
    <main className="flex-1 h-auto overflow-hidden">
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-white text-base sm:text-lg md:text-xl flex items-center gap-2 leading-tight">
            <MdVerifiedUser className="w-5 h-5" />
            <span className="whitespace-normal"> Consent & Legal (DoLS)</span>
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center gap-2 text-xs sm:text-sm md:text-base"
            >
              <FaPlus className="w-4 h-4" />
              <span className="whitespace-nowrap">Add DoLS Record</span>
            </button>

            <button
              onClick={() => setShowArchived(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center gap-2 text-xs sm:text-sm md:text-base"
            >
              <FaArchive className="w-4 h-4" />
              <span className="whitespace-nowrap">View Archived</span>
            </button>
          </div>
        </div>

        {/* Active List */}
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-3 text-lg">Deprivation of Liberty Safeguards (DoLS)</h3>

          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full divide-y divide-gray-700 text-sm">
              <thead className="bg-gray-700">
                <tr>
                  {["DoLS Status", "Authorization End Date", "Conditions", "Actions"].map((col, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {consents.length > 0 ? (
                  consents.map((record) => (
                    <tr key={record._id}>
                      <td className="px-4 py-3 text-white">
                        <span className={`px-2 py-1 rounded text-xs ${record.dolsInPlace === "Yes" ? "bg-red-500" : "bg-green-500"}`}>
                            {record.dolsInPlace || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">{record.authorizationEndDate ? new Date(record.authorizationEndDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3 text-white truncate max-w-xs">{record.conditions || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-3 text-white text-sm relative">
                           <button onClick={() => handleView(record)} className="hover:text-blue-500 cursor-pointer" title="View"><FaEye /></button>
                           <button onClick={() => handleEdit(record)} className="hover:text-yellow-400 cursor-pointer" title="Edit"><FaEdit /></button>
                           <button onClick={() => handleDelete(record._id)} className="hover:text-red-500 cursor-pointer" title="Delete"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="text-center px-4 py-20 text-gray-400">No Records Found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-xl rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">{editingId ? "Edit DoLS Record" : "Add DoLS Record"}</h2>
              <button type="button" onClick={resetForm} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes /></button>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-2 text-white">
                <div>
                  <label className="text-sm text-gray-300">DoLS in Place?</label>
                  <select value={form.dolsInPlace} onChange={(e) => setForm({ ...form, dolsInPlace: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" required>
                    <option value="">Select Status</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Authorization End Date</label>
                  <input type="date" value={form.authorizationEndDate} onChange={(e) => setForm({ ...form, authorizationEndDate: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Conditions</label>
                  <textarea value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" rows={3} placeholder="Enter any specific conditions..." />
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={resetForm} className="bg-gray-600 px-4 py-2 rounded text-white">Cancel</button>
                  <button type="submit" className="bg-indigo-600 px-4 py-2 rounded text-white">{editingId ? "Update Record" : "Save Record"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal (Syced with PBS/Medication style) */}
        {viewConsent && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-lg rounded-lg p-6 shadow-lg overflow-y-auto max-h-[90vh]"
              style={{ backgroundColor: "#111827", color: "#ffffff" }}
            >
              <h2 className="text-2xl font-semibold mb-6">Consent & Legal Details</h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <strong>DoLS in Place?</strong>
                  <p className={`bg-gray-800 p-3 rounded mt-1 ${viewConsent.dolsInPlace === "Yes" ? "text-red-400" : "text-green-400"}`}>
                    {viewConsent.dolsInPlace || "N/A"}
                  </p>
                </div>

                <div>
                  <strong>Authorization End Date:</strong>
                  <p className="bg-gray-800 p-3 rounded mt-1">
                    {viewConsent.authorizationEndDate ? new Date(viewConsent.authorizationEndDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>

                <div>
                  <strong>Conditions:</strong>
                  <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewConsent.conditions || "None Specified"}</p>
                </div>

                {viewConsent.createdAt && (
                  <div>
                    <strong>Date Created:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">
                      {new Date(viewConsent.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 flex-wrap">
                <button onClick={closeView} className="bg-gray-600 px-4 py-1.5 rounded hover:bg-gray-700 text-sm">Close</button>
                <button onClick={() => window.print()} className="bg-red-600 px-4 py-1.5 rounded hover:bg-red-700 text-sm text-white">Print</button>
                <button onClick={() => handleDownloadPdf(viewConsent)} className="bg-green-600 px-4 py-1.5 rounded hover:bg-green-700 text-sm text-white">Export PDF</button>
                <button onClick={() => { handleDelete(viewConsent._id); closeView(); }} className="bg-red-700 px-4 py-1.5 rounded hover:bg-red-800 text-sm text-white">Delete</button>
                <button onClick={() => { handleEdit(viewConsent); closeView(); }} className="bg-blue-600 px-4 py-1.5 rounded hover:bg-blue-700 text-sm text-white">Edit</button>
              </div>
            </div>
          </div>
        )}

        {/* Archived Modal */}
        {showArchived && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">Archived Records (Older than 6 months)</h2>
              <button type="button" onClick={() => setShowArchived(false)} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes /></button>

              <div className="text-white text-sm max-h-[60vh] overflow-y-auto space-y-2">
                {archivedConsents.length > 0 ? (
                  archivedConsents.map((r) => (
                    <div key={r._id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                        <div className="truncate max-w-[60%]">
                            <p className="font-bold">DoLS: {r.dolsInPlace}</p>
                            <p className="text-xs text-gray-400">Expires: {r.authorizationEndDate ? new Date(r.authorizationEndDate).toLocaleDateString() : "N/A"}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { handleView(r); setShowArchived(false); }} className="text-blue-400 hover:text-blue-300">View</button>
                            <button onClick={() => handleDelete(r._id)} className="text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No archived records found.</p>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button onClick={() => setShowArchived(false)} className="bg-gray-600 px-4 py-2 rounded text-white">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ResidentProfileConsentForm;
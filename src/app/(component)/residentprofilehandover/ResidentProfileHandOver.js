"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaTimes,
  FaArchive,
  FaHandshake,
} from "react-icons/fa";

const ResidentProfileHandOver = ({ clientId }) => {
  const [handovers, setHandovers] = useState([]);
  const [archivedHandovers, setArchivedHandovers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewHandover, setViewHandover] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const [form, setForm] = useState({
    date: "",
    time: "",
    handingOver: "",
    takingOver: "",
    summaryNotes: "",
  });

  // ✅ Fetch Active Handover Records
  useEffect(() => {
    if (!clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/handover/client/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setHandovers(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching Handover Records:", err));
  }, [clientId]);

  // ✅ Fetch Archived Records (older than 6 months)
  useEffect(() => {
    if (!showArchived || !clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/handover/older-than-six-months`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const clientRecords = (data.handovers || []).filter(
          (h) => h.client && (h.client._id === clientId || h.client === clientId)
        );
        setArchivedHandovers(clientRecords);
      })
      .catch((err) => console.error("Error fetching archived handovers:", err));
  }, [showArchived, clientId]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ date: "", time: "", handingOver: "", takingOver: "", summaryNotes: "" });
    setShowForm(false);
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    setForm({
      date: record.date ? record.date.slice(0, 10) : "",
      time: record.time || "",
      handingOver: record.handingOver || "",
      takingOver: record.takingOver || "",
      summaryNotes: record.summaryNotes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this Handover Record?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/handover/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setHandovers((prev) => prev.filter((h) => h._id !== id));
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
      date: form.date,
      time: form.time,
      handingOver: form.handingOver,
      takingOver: form.takingOver,
      summaryNotes: form.summaryNotes,
    };

    try {
      if (editingId) {
        // Update
        const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/handover/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updated = await res.json();
          setHandovers((prev) => prev.map((h) => (h._id === editingId ? updated : h)));
          alert("Record updated successfully!");
          resetForm();
        } else {
          alert("Failed to update record");
        }
      } else {
        // Create
        const res = await fetch("https://admin-panel-backend-alpha.vercel.app/handover", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const newItem = await res.json();
          setHandovers((prev) => [newItem, ...prev]);
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
    doc.text("Shift Handover Details", 14, 15);

    const mainRows = [];
    if (item.date) mainRows.push(["Date", new Date(item.date).toLocaleDateString()]);
    if (item.time) mainRows.push(["Time", item.time]);
    if (item.handingOver) mainRows.push(["Handing Over", item.handingOver]);
    if (item.takingOver) mainRows.push(["Taking Over", item.takingOver]);
    if (item.summaryNotes) mainRows.push(["Summary Notes", item.summaryNotes]);

    if (mainRows.length) {
      autoTable(doc, {
        startY: 25,
        head: [["Field", "Value"]],
        body: mainRows,
        styles: { cellPadding: 3, fontSize: 10 },
        headStyles: { fillColor: [249, 115, 22] }, // Orange for Handovers
      });
    }

    const filename = `Handover_${item._id}.pdf`;
    doc.save(filename);
  };

  const handleView = (record) => {
    setViewHandover(record);
  };

  const closeView = () => setViewHandover(null);

  return (
    <main className="flex-1 h-auto overflow-hidden">
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-white text-base sm:text-lg md:text-xl flex items-center gap-2 leading-tight">
            <FaHandshake className="w-5 h-5" />
            <span className="whitespace-normal"> Handovers</span>
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center gap-2 text-xs sm:text-sm md:text-base"
            >
              <FaPlus className="w-4 h-4" />
              <span className="whitespace-nowrap">Add New Shift Handover</span>
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
          <h3 className="text-white font-semibold mb-3 text-lg">Latest Shift Handovers</h3>

          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full divide-y divide-gray-700 text-sm">
              <thead className="bg-gray-700">
                <tr>
                  {["Date", "Time", "Handing Over", "Taking Over", "Summary", "Actions"].map((col, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {handovers.length > 0 ? (
                  handovers.map((h) => (
                    <tr key={h._id}>
                      <td className="px-4 py-3 text-white">{h.date ? new Date(h.date).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3 text-white">{h.time || "-"}</td>
                      <td className="px-4 py-3 text-white">{h.handingOver || "-"}</td>
                      <td className="px-4 py-3 text-white">{h.takingOver || "-"}</td>
                      <td className="px-4 py-3 text-white truncate max-w-xs">{h.summaryNotes || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-3 text-white text-sm relative">
                           <button onClick={() => handleView(h)} className="hover:text-blue-500 cursor-pointer" title="View"><FaEye /></button>
                           <button onClick={() => handleEdit(h)} className="hover:text-yellow-400 cursor-pointer" title="Edit"><FaEdit /></button>
                           <button onClick={() => handleDelete(h._id)} className="hover:text-red-500 cursor-pointer" title="Delete"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center px-4 py-20 text-gray-400">No Handover Records Found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-xl rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">{editingId ? "Edit Handover" : "Add Shift Handover"}</h2>
              <button type="button" onClick={resetForm} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes /></button>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-2 text-white">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" required />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">Time</label>
                    <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" required />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300">Handing Over (Staff Name)</label>
                    <input value={form.handingOver} onChange={(e) => setForm({ ...form, handingOver: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" required />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">Taking Over (Staff Name)</label>
                    <input value={form.takingOver} onChange={(e) => setForm({ ...form, takingOver: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" required />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Summary Notes</label>
                  <textarea value={form.summaryNotes} onChange={(e) => setForm({ ...form, summaryNotes: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" rows={4} placeholder="e.g. Resident had a settled night..." required />
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={resetForm} className="bg-gray-600 px-4 py-2 rounded text-white">Cancel</button>
                  <button type="submit" className="bg-indigo-600 px-4 py-2 rounded text-white">{editingId ? "Update Handover" : "Save Handover"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal (Syced with PBS/Medication style) */}
        {viewHandover && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-lg rounded-lg p-6 shadow-lg overflow-y-auto max-h-[90vh]"
              style={{ backgroundColor: "#111827", color: "#ffffff" }}
            >
              <h2 className="text-2xl font-semibold mb-6">Shift Handover Details</h2>
              
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Date:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">
                      {viewHandover.date ? new Date(viewHandover.date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <strong>Time:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewHandover.time || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Handing Over From:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewHandover.handingOver || "N/A"}</p>
                  </div>
                  <div>
                    <strong>Taking Over To:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewHandover.takingOver || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <strong>Summary Notes:</strong>
                  <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewHandover.summaryNotes || "No summary notes provided."}</p>
                </div>

                {viewHandover.createdAt && (
                  <div>
                    <strong>Logged On:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">
                      {new Date(viewHandover.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 flex-wrap">
                <button onClick={closeView} className="bg-gray-600 px-4 py-1.5 rounded hover:bg-gray-700 text-sm">Close</button>
                <button onClick={() => window.print()} className="bg-red-600 px-4 py-1.5 rounded hover:bg-red-700 text-sm text-white font-medium">Print</button>
                <button onClick={() => handleDownloadPdf(viewHandover)} className="bg-green-600 px-4 py-1.5 rounded hover:bg-green-700 text-sm text-white font-medium">Export PDF</button>
                <button onClick={() => { handleDelete(viewHandover._id); closeView(); }} className="bg-red-700 px-4 py-1.5 rounded hover:bg-red-800 text-sm text-white font-medium">Delete</button>
                <button onClick={() => { handleEdit(viewHandover); closeView(); }} className="bg-blue-600 px-4 py-1.5 rounded hover:bg-blue-700 text-sm text-white font-medium">Edit</button>
              </div>
            </div>
          </div>
        )}

        {/* Archived Modal */}
        {showArchived && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">Archived Handovers (Older than 6 months)</h2>
              <button type="button" onClick={() => setShowArchived(false)} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes /></button>

              <div className="text-white text-sm max-h-[60vh] overflow-y-auto space-y-2">
                {archivedHandovers.length > 0 ? (
                  archivedHandovers.map((h) => (
                    <div key={h._id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                        <div className="truncate max-w-[60%]">
                            <p className="font-bold">{new Date(h.date).toLocaleDateString()} at {h.time}</p>
                            <p className="text-xs text-gray-400 truncate">{h.summaryNotes}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { handleView(h); setShowArchived(false); }} className="text-blue-400 hover:text-blue-300">View</button>
                            <button onClick={() => handleDelete(h._id)} className="text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No archived handovers found.</p>
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

export default ResidentProfileHandOver;
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
import { IoBookOutline } from "react-icons/io5";

const ResidentProfileDailyLog = ({ clientId }) => {
  const [logs, setLogs] = useState([]);
  const [archivedLogs, setArchivedLogs] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [viewLog, setViewLog] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const [logForm, setLogForm] = useState({
    dateTime: "",
    staffName: "",
    notes: "",
    moodEmoji: "",
    bristolScore: "",
    heartRate: "",
    healthQuick: "",
  });

  // ✅ Fetch Active Daily Logs
  useEffect(() => {
    if (!clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/daily-log/client/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching Daily Logs:", err));
  }, [clientId]);

  // ✅ Fetch Archived Logs (older than 6 months)
  useEffect(() => {
    if (!showArchived || !clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/daily-log/older-than-six-months`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const clientLogs = (data.logs || []).filter(
          (log) => log.client && (log.client._id === clientId || log.client === clientId)
        );
        setArchivedLogs(clientLogs);
      })
      .catch((err) => console.error("Error fetching archived logs:", err));
  }, [showArchived, clientId]);

  const resetLogForm = () => {
    setEditingLogId(null);
    setLogForm({ dateTime: "", staffName: "", notes: "", moodEmoji: "", bristolScore: "", heartRate: "", healthQuick: "" });
    setShowLogForm(false);
  };

  const handleEdit = (log) => {
    setEditingLogId(log._id);
    setLogForm({
      dateTime: log.dateTime ? log.dateTime.slice(0, 16) : "", // Format for datetime-local
      staffName: log.staffName || "",
      notes: log.notes || "",
      moodEmoji: log.moodEmoji || "",
      bristolScore: log.bristolScore || "",
      heartRate: log.heartRate || "",
      healthQuick: log.healthQuick || "",
    });
    setShowLogForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this Daily Log?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/daily-log/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setLogs((prev) => prev.filter((l) => l._id !== id));
        alert("Daily Log deleted successfully!");
      } else {
        alert("Failed to delete log");
      }
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      clientId,
      dateTime: logForm.dateTime,
      staffName: logForm.staffName,
      notes: logForm.notes,
      moodEmoji: logForm.moodEmoji,
      bristolScore: logForm.bristolScore,
      heartRate: logForm.heartRate,
      healthQuick: logForm.healthQuick,
    };

    try {
      if (editingLogId) {
        // Update
        const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/daily-log/${editingLogId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updated = await res.json();
          setLogs((prev) => prev.map((l) => (l._id === editingLogId ? updated : l)));
          alert("Daily Log updated successfully!");
          resetLogForm();
        } else {
          alert("Failed to update log");
        }
      } else {
        // Create
        const res = await fetch("https://admin-panel-backend-alpha.vercel.app/daily-log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const newItem = await res.json();
          setLogs((prev) => [newItem, ...prev]);
          alert("Daily Log created successfully!");
          resetLogForm();
        } else {
          alert("Failed to create log");
        }
      }
    } catch (error) {
      console.error("Error saving log:", error);
      alert("An error occurred while saving.");
    }
  };

  const handleDownloadPdf = async (item) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Daily Log Details", 14, 15);

    const mainRows = [];
    if (item.dateTime) mainRows.push(["Date & Time", new Date(item.dateTime).toLocaleString()]);
    if (item.staffName) mainRows.push(["Staff Name", item.staffName]);
    if (item.notes) mainRows.push(["Notes", item.notes]);
    if (item.moodEmoji) mainRows.push(["Mood", getMoodEmoji(item.moodEmoji)]);
    if (item.bristolScore) mainRows.push(["Bristol Score", item.bristolScore]);
    if (item.heartRate) mainRows.push(["Heart Rate", `${item.heartRate} BPM`]);
    if (item.healthQuick) mainRows.push(["Health Quick Entry", item.healthQuick]);

    if (mainRows.length) {
      autoTable(doc, {
        startY: 25,
        head: [["Field", "Value"]],
        body: mainRows,
        styles: { cellPadding: 3, fontSize: 10 },
        headStyles: { fillColor: [16, 185, 129] }, // Emerald Green
      });
    }

    const filename = `DailyLog_${item._id}.pdf`;
    doc.save(filename);
  };

  const handleView = (log) => {
    setViewLog(log);
  };

  const closeView = () => setViewLog(null);

  const getMoodEmoji = (moodValue) => {
    const moodMap = {
      happy: "🙂 Happy",
      neutral: "😐 Neutral",
      sad: "☹️ Sad",
      agitated: "😣 Agitated",
    };
    return moodMap[moodValue] || moodValue || "-";
  };

  return (
    <main className="flex-1 h-auto overflow-hidden">
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-white text-base sm:text-lg md:text-xl flex items-center gap-2 leading-tight">
            <IoBookOutline className="w-5 h-5" />
            <span className="whitespace-normal"> Daily Logs & Health Recordings</span>
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowLogForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center gap-2 text-xs sm:text-sm md:text-base"
            >
              <FaPlus className="w-4 h-4" />
              <span className="whitespace-nowrap">Create New Daily Log</span>
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

        {/* Active Logs List */}
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-3 text-lg">Recent Logs</h3>

          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full divide-y divide-gray-700 text-sm">
              <thead className="bg-gray-700">
                <tr>
                  {["Date & Time", "Staff", "Note Summary", "Mood", "Actions"].map((col, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td className="px-4 py-3 text-white">{log.dateTime ? new Date(log.dateTime).toLocaleString() : "-"}</td>
                      <td className="px-4 py-3 text-white">{log.staffName || "-"}</td>
                      <td className="px-4 py-3 text-white truncate max-w-xs">{log.notes || "-"}</td>
                      <td className="px-4 py-3 text-white">{getMoodEmoji(log.moodEmoji)}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-3 text-white text-sm relative">
                           <button onClick={() => handleView(log)} className="hover:text-blue-500 cursor-pointer" title="View"><FaEye /></button>
                           <button onClick={() => handleEdit(log)} className="hover:text-yellow-400 cursor-pointer" title="Edit"><FaEdit /></button>
                           <button onClick={() => handleDelete(log._id)} className="hover:text-red-500 cursor-pointer" title="Delete"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center px-4 py-20 text-gray-400">No Daily Logs Found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log Form Modal */}
        {showLogForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-xl rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">{editingLogId ? "Edit Daily Log" : "Create New Daily Log"}</h2>
              <button type="button" onClick={resetLogForm} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes /></button>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-2 text-white">
                <div>
                  <label className="text-sm text-gray-300">Date & Time</label>
                  <input type="datetime-local" value={logForm.dateTime} onChange={(e) => setLogForm({ ...logForm, dateTime: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" required />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Staff / Caregiver Name</label>
                  <input value={logForm.staffName} onChange={(e) => setLogForm({ ...logForm, staffName: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" required />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Notes / General Update</label>
                  <textarea value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" rows={3} />
                </div>
                
                {/* Health Quick Entry field found in user request */}
                <div>
                   <label className="text-sm text-gray-300">Health Quick Entry (Optional)</label>
                   <input value={logForm.healthQuick} onChange={(e) => setLogForm({ ...logForm, healthQuick: e.target.value })} placeholder="e.g. Took meds, slight fever" className="w-full p-2 bg-gray-700 rounded text-white" />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-300">Mood</label>
                    <select value={logForm.moodEmoji} onChange={(e) => setLogForm({ ...logForm, moodEmoji: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white">
                      <option value="">Select</option>
                      <option value="happy">🙂 Happy</option>
                      <option value="neutral">😐 Neutral</option>
                      <option value="sad">☹️ Sad</option>
                      <option value="agitated">😣 Agitated</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">Bristol Score (1-7)</label>
                    <input type="number" min="1" max="7" value={logForm.bristolScore} onChange={(e) => setLogForm({ ...logForm, bristolScore: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">Heart Rate (BPM)</label>
                    <input type="number" min="0" value={logForm.heartRate} onChange={(e) => setLogForm({ ...logForm, heartRate: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={resetLogForm} className="bg-gray-600 px-4 py-2 rounded text-white">Cancel</button>
                  <button type="submit" className="bg-indigo-600 px-4 py-2 rounded text-white">{editingLogId ? "Update Log" : "Save Log"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal (Syced with PBS/Medication style) */}
        {viewLog && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-2xl rounded-lg p-6 shadow-lg overflow-y-auto max-h-[90vh]"
              style={{ backgroundColor: "#111827", color: "#ffffff" }}
            >
              <h2 className="text-2xl font-semibold mb-6">Daily Log Details</h2>
              
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <strong>Date & Time:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">
                      {viewLog.dateTime ? new Date(viewLog.dateTime).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <strong>Staff Name:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewLog.staffName || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <strong>General Notes / Observations:</strong>
                  <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewLog.notes || "No notes provided."}</p>
                </div>

                {viewLog.healthQuick && (
                  <div>
                    <strong>Health Quick Entry:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">{viewLog.healthQuick}</p>
                  </div>
                )}

                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">Health & Wellness Indicators</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <span className="block text-xs text-gray-400 mb-1">Mood</span>
                      <div className="bg-gray-800 py-2 px-1 rounded font-medium text-indigo-300">
                        {getMoodEmoji(viewLog.moodEmoji)}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-gray-400 mb-1">Bristol Score</span>
                      <div className="bg-gray-800 py-2 px-1 rounded font-medium text-emerald-300">
                        {viewLog.bristolScore || "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-gray-400 mb-1">Heart Rate</span>
                      <div className="bg-gray-800 py-2 px-1 rounded font-medium text-rose-300">
                        {viewLog.heartRate ? `${viewLog.heartRate} BPM` : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {viewLog.createdAt && (
                  <div>
                    <strong>Record Logged:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1 text-xs text-gray-400">
                      {new Date(viewLog.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 flex-wrap">
                <button
                  onClick={closeView}
                  className="bg-gray-600 px-4 py-1.5 rounded hover:bg-gray-700 text-sm font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-red-600 px-4 py-1.5 rounded hover:bg-red-700 text-sm text-white font-medium"
                >
                  Print Log
                </button>
                <button
                  onClick={() => handleDownloadPdf(viewLog)}
                  className="bg-green-600 px-4 py-1.5 rounded hover:bg-green-700 text-sm text-white font-medium"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => { handleDelete(viewLog._id); closeView(); }}
                  className="bg-red-700 px-4 py-1.5 rounded hover:bg-red-800 text-sm text-white font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => { handleEdit(viewLog); closeView(); }}
                  className="bg-blue-600 px-4 py-1.5 rounded hover:bg-blue-700 text-sm text-white font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Archived Modal */}
        {showArchived && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">Archived Logs (Older than 6 months)</h2>
              <button type="button" onClick={() => setShowArchived(false)} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes /></button>

              <div className="text-white text-sm max-h-[60vh] overflow-y-auto space-y-2">
                {archivedLogs.length > 0 ? (
                  archivedLogs.map((log) => (
                    <div key={log._id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                        <div className="truncate max-w-[60%]">
                            <p className="font-bold">{new Date(log.dateTime).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400 truncate">{log.notes || "No notes"}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { handleView(log); setShowArchived(false); }} className="text-blue-400 hover:text-blue-300">View</button>
                            <button onClick={() => handleDelete(log._id)} className="text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No archived logs found.</p>
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

export default ResidentProfileDailyLog;
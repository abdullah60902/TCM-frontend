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
import { LuGoal } from "react-icons/lu";

const ResidentProfileGoalsOutcome = ({ clientId }) => {
  const [goals, setGoals] = useState([]);
  const [archivedGoals, setArchivedGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [viewGoal, setViewGoal] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const [goalForm, setGoalForm] = useState({
    title: "",
    startDate: "",
    targetDate: "",
    metric: "",
    status: "",
  });

  // ✅ Fetch Active Goals
  useEffect(() => {
    if (!clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/goals/client/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setGoals(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching Goals:", err));
  }, [clientId]);

  // ✅ Fetch Archived Goals (older than 6 months)
  useEffect(() => {
    if (!showArchived || !clientId) return;

    const token = localStorage.getItem("token");
    fetch(`https://admin-panel-backend-alpha.vercel.app/goals/older-than-six-months`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const clientGoals = (data.goals || []).filter(
          (g) => g.client && (g.client._id === clientId || g.client === clientId)
        );
        setArchivedGoals(clientGoals);
      })
      .catch((err) => console.error("Error fetching archived Goals:", err));
  }, [showArchived, clientId]);

  const resetGoalForm = () => {
    setEditingGoalId(null);
    setGoalForm({ title: "", startDate: "", targetDate: "", metric: "", status: "" });
    setShowGoalForm(false);
  };

  const handleGoalEdit = (goal) => {
    setEditingGoalId(goal._id);
    setGoalForm({
      title: goal.title || "",
      startDate: goal.startDate ? goal.startDate.slice(0, 10) : "",
      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : "",
      metric: goal.metric || "",
      status: goal.status || "",
    });
    setShowGoalForm(true);
  };

  const handleGoalDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this Goal?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setGoals((prev) => prev.filter((g) => g._id !== id));
        alert("Goal deleted successfully!");
      } else {
        alert("Failed to delete Goal");
      }
    } catch (error) {
      console.error("Error deleting Goal:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      clientId,
      title: goalForm.title,
      startDate: goalForm.startDate,
      targetDate: goalForm.targetDate,
      metric: goalForm.metric,
      status: goalForm.status,
    };

    try {
      if (editingGoalId) {
        // Update
        const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/goals/${editingGoalId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updated = await res.json();
          setGoals((prev) => prev.map((g) => (g._id === editingGoalId ? updated : g)));
          alert("Goal updated successfully!");
          resetGoalForm();
        } else {
          alert("Failed to update Goal");
        }
      } else {
        // Create
        const res = await fetch("https://admin-panel-backend-alpha.vercel.app/goals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const newItem = await res.json();
          setGoals((prev) => [newItem, ...prev]);
          alert("Goal created successfully!");
          resetGoalForm();
        } else {
          alert("Failed to create Goal");
        }
      }
    } catch (error) {
      console.error("Error saving Goal:", error);
      alert("An error occurred while saving.");
    }
  };

  const handleDownloadPdf = async (item) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Goal Details", 14, 15);

    const mainRows = [];
    if (item.title) mainRows.push(["Goal", item.title]);
    if (item.startDate) mainRows.push(["Start Date", new Date(item.startDate).toLocaleDateString()]);
    if (item.targetDate) mainRows.push(["Target Completion", new Date(item.targetDate).toLocaleDateString()]);
    if (item.metric) mainRows.push(["Metric", item.metric]);
    if (item.status) mainRows.push(["Status", item.status]);

    if (item.statusHistory && item.statusHistory.length > 0) {
      mainRows.push(["Status History", ""]);
      item.statusHistory.forEach(h => {
         mainRows.push([`- ${h.status}`, `${new Date(h.changedAt).toLocaleDateString()} by ${h.changedBy || 'Unknown'}`]);
      });
    }

    if (mainRows.length) {
      autoTable(doc, {
        startY: 25,
        head: [["Field", "Value"]],
        body: mainRows,
        styles: { cellPadding: 3, fontSize: 10 },
        headStyles: { fillColor: [79, 70, 229] }, // Indigo for Goals
      });
    }

    const filename = item.title 
      ? `${item.title.replace(/\s+/g, '_')}_Goal.pdf`
      : `Goal_${item._id}.pdf`;
    doc.save(filename);
  };

  const handleView = (goal) => {
    setViewGoal(goal);
  };

  const closeView = () => setViewGoal(null);

  return (
    <main className="flex-1 h-auto overflow-hidden">
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-white text-base sm:text-lg md:text-xl flex items-center gap-2 leading-tight">
            <LuGoal className="w-5 h-5" />
            <span className="whitespace-normal"> Goals & Outcomes</span>
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowGoalForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded flex items-center gap-2 text-xs sm:text-sm md:text-base"
            >
              <FaPlus className="w-4 h-4" />
              <span className="whitespace-nowrap">Create New Goals</span>
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

        {/* Active Goals List */}
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-3 text-lg">Active Goals</h3>

          {/* Goals Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full divide-y divide-gray-700 text-sm">
              <thead className="bg-gray-700">
                <tr>
                  {["Goal", "Start Date", "Target Completion", "Goal Metric", "Current Status", "Actions"].map((col, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {goals.length > 0 ? (
                  goals.map((g) => (
                    <tr key={g._id}>
                      <td className="px-4 py-3 text-white">{g.title}</td>
                      <td className="px-4 py-3 text-white">{g.startDate ? new Date(g.startDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3 text-white">{g.targetDate ? new Date(g.targetDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3 text-white">{g.metric || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          g.status === "Complete" ? "bg-green-500 text-white" : 
                          g.status === "In Progress" ? "bg-yellow-500 text-black" : 
                          "bg-gray-500 text-white"
                        }`}>
                          {g.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-3 text-white text-sm">
                           <button onClick={() => handleView(g)} className="hover:text-blue-500 cursor-pointer" title="View"><FaEye /></button>
                           <button onClick={() => handleGoalEdit(g)} className="hover:text-yellow-400 cursor-pointer" title="Edit"><FaEdit /></button>
                           <button onClick={() => handleGoalDelete(g._id)} className="hover:text-red-500 cursor-pointer" title="Delete"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center px-4 py-20 text-gray-400">No Goals Found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Goal Form Modal */}
        {showGoalForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-xl rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">{editingGoalId ? "Edit Goal" : "Create New Goal"}</h2>
              <button type="button" onClick={resetGoalForm} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes /></button>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-2 text-white">
                <div>
                  <label className="text-sm text-gray-300">Goal Title</label>
                  <input value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" required />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300">Start Date</label>
                    <input type="date" value={goalForm.startDate} onChange={(e) => setGoalForm({ ...goalForm, startDate: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">Target Completion</label>
                    <input type="date" value={goalForm.targetDate} onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Goal Metric</label>
                  <input value={goalForm.metric} onChange={(e) => setGoalForm({ ...goalForm, metric: e.target.value })} placeholder="e.g., 3 independent meals per week" className="w-full p-2 bg-gray-700 rounded text-white" />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Status</label>
                  <select value={goalForm.status} onChange={(e) => setGoalForm({ ...goalForm, status: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-white">
                    <option value="">Select</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={resetGoalForm} className="bg-gray-600 px-4 py-2 rounded text-white">Cancel</button>
                  <button type="submit" className="bg-indigo-600 px-4 py-2 rounded text-white">{editingGoalId ? "Update Goal" : "Save Goal"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal (Syced with PBS/Medication style) */}
        {viewGoal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-lg rounded-lg p-6 shadow-lg overflow-y-auto max-h-[90vh]"
              style={{ backgroundColor: "#111827", color: "#ffffff" }}
            >
              <h2 className="text-2xl font-semibold mb-6">Goal Details</h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <strong>Goal Title:</strong>
                  <p className="bg-gray-800 p-3 rounded mt-1 font-medium">{viewGoal.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Start Date:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">
                      {viewGoal.startDate ? new Date(viewGoal.startDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <strong>Target Completion:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">
                      {viewGoal.targetDate ? new Date(viewGoal.targetDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <strong>Goal Metric / Outcome:</strong>
                  <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewGoal.metric || "No metric specified."}</p>
                </div>

                <div>
                  <strong>Current Status:</strong>
                  <div className="mt-1">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      viewGoal.status === "Complete" ? "bg-green-900/50 text-green-400 border border-green-700" : 
                      viewGoal.status === "In Progress" ? "bg-yellow-900/50 text-yellow-400 border border-yellow-700" : 
                      "bg-gray-700 text-gray-300 border border-gray-600"
                    }`}>
                      {viewGoal.status || "N/A"}
                    </span>
                  </div>
                </div>

                {viewGoal.statusHistory && viewGoal.statusHistory.length > 0 && (
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mt-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Status History Track</h4>
                    <div className="space-y-2">
                        {viewGoal.statusHistory.map((h, i) => (
                          <div key={i} className="flex justify-between items-center bg-gray-800/50 p-2 rounded text-[11px]">
                            <span className="text-indigo-300 font-medium">{h.status}</span>
                            <span className="text-gray-500">{new Date(h.changedAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 flex-wrap">
                <button onClick={closeView} className="bg-gray-600 px-4 py-1.5 rounded hover:bg-gray-700 text-sm font-medium">Close</button>
                <button onClick={() => window.print()} className="bg-red-600 px-4 py-1.5 rounded hover:bg-red-700 text-sm text-white font-medium">Print</button>
                <button onClick={() => handleDownloadPdf(viewGoal)} className="bg-green-600 px-4 py-1.5 rounded hover:bg-green-700 text-sm text-white font-medium">Export PDF</button>
                <button onClick={() => { handleGoalDelete(viewGoal._id); closeView(); }} className="bg-red-700 px-4 py-1.5 rounded hover:bg-red-800 text-sm text-white font-medium">Delete</button>
                <button onClick={() => { handleGoalEdit(viewGoal); closeView(); }} className="bg-blue-600 px-4 py-1.5 rounded hover:bg-blue-700 text-sm text-white font-medium">Edit</button>
              </div>
            </div>
          </div>
        )}

        {/* Archived Modal */}
        {showArchived && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 w-full max-w-lg rounded-lg p-6 relative">
              <h2 className="text-white text-xl font-semibold mb-4">Archived Goals</h2>
              <button type="button" onClick={() => setShowArchived(false)} className="absolute top-4 right-4 text-white hover:text-gray-300"><FaTimes /></button>

              <div className="text-white text-sm max-h-[60vh] overflow-y-auto space-y-2">
                {archivedGoals.length > 0 ? (
                  archivedGoals.map((g) => (
                    <div key={g._id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                        <div>
                            <p className="font-bold">{g.title}</p>
                            <p className="text-xs text-gray-400">Target: {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : "N/A"}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { handleView(g); setShowArchived(false); }} className="text-blue-400 hover:text-blue-300">View</button>
                            <button onClick={() => handleGoalDelete(g._id)} className="text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No archived goals found.</p>
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

export default ResidentProfileGoalsOutcome;
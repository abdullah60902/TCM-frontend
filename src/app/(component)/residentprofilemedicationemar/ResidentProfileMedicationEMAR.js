"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaTimes,
  FaArchive,
  FaHistory,
} from "react-icons/fa";
import { MdOutlineMedication } from "react-icons/md";
import axios from "axios";

const ResidentProfileMedicationEMAR = ({ clientId }) => {
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'history'
  
  const [medications, setMedications] = useState([]); // From /medications
  const [adminHistory, setAdminHistory] = useState([]); // From /medication-administration
  
  const [showForm, setShowForm] = useState(false); // For New Medication Order
  const [showAdminForm, setShowAdminForm] = useState(false); // For Recording Dose
  
  const [editingId, setEditingId] = useState(null);
  const [editingAdminId, setEditingAdminId] = useState(null); // For history record edit
  const [selectedMedForAdmin, setSelectedMedForAdmin] = useState(null); // Which URL to record dose for
  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState(null); // 'order' | 'history'
  
  // Form State for Medication Order
  const [medForm, setMedForm] = useState({
    medicationName: "",
    frequency: "", 
    times: "", // comma separated
    stock: { quantity: 0, threshold: 5 },
    status: "Pending",
  });

  // Form State for Administration
  const [adminForm, setAdminForm] = useState({
    caregiverName: "",
    time: "",
    given: "Yes",
    notes: ""
  });

  // ✅ Fetch Data
  useEffect(() => {
    if (!clientId) return;
    fetchData();
  }, [clientId, fetchData]);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if(!token) return;

    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // 1. Fetch Medications (Stock/Orders)
      // Trying client-specific endpoint first
      let medsData = [];
      try {
          const res = await axios.get(`https://admin-panel-backend-alpha.vercel.app/medications/client/${clientId}`, config);
          medsData = res.data;
      } catch (e) {
          // Fallback: Fetch all and filter if specific endpoint fails or doesn't exist
          const resAll = await axios.get(`https://admin-panel-backend-alpha.vercel.app/medications`, config);
          // Filter carefully matching ObjectId or String
          medsData = resAll.data.filter(m => {
             const mClientId = m.client?._id || m.client;
             return mClientId === clientId;
          });
      }
      setMedications(Array.isArray(medsData) ? medsData : []);


      // 2. Fetch Administration History
      const adminRes = await axios.get(`https://admin-panel-backend-alpha.vercel.app/medication-administration`, config);
      const allHistory = Array.isArray(adminRes.data) ? adminRes.data : [];
      
      // Filter for this client
      const myHistory = allHistory.filter(item => {
        const itemClientId = item.client?._id || item.client;
        return itemClientId === clientId;
      });
      setAdminHistory(myHistory);

    } catch (err) {
      console.error("Error fetching medication data:", err);
    }
  }, [clientId]);

  const handleCreateMedication = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
        // Construct payload to match Medication-Management/page.js structure
        const timesArray = medForm.times.split(",").map(t => t.trim()).filter(Boolean);

        const payload = {
            client: clientId,
            medicationName: medForm.medicationName,
            caregiverName: "Staff", 
            schedule: { 
                frequency: medForm.frequency, 
                times: timesArray 
            },
            stock: medForm.stock,
            status: medForm.status || "Pending"
        };

        if(editingId) {
            await axios.put(`https://admin-panel-backend-alpha.vercel.app/medications/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            alert("Medication updated!");
        } else {
            await axios.post(`https://admin-panel-backend-alpha.vercel.app/medications`, payload, { headers: { Authorization: `Bearer ${token}` } });
            alert("Medication added!");
        }
        setShowForm(false);
        setEditingId(null);
        fetchData();
    } catch(err) {
        console.error(err);
        alert("Failed to save medication");
    }
  };

  const handleRecordDose = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if(!selectedMedForAdmin) return;

    try {
        const payload = {
            client: clientId,
            medication: selectedMedForAdmin._id,
            caregiverName: adminForm.caregiverName || "Staff",
            time: adminForm.time,
            given: adminForm.given === "Yes",
            notes: adminForm.notes
        };

        if (editingAdminId) {
            await axios.put(`https://admin-panel-backend-alpha.vercel.app/medication-administration/${editingAdminId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            alert("Dose record updated successfully!");
        } else {
            await axios.post(`https://admin-panel-backend-alpha.vercel.app/medication-administration`, payload, { headers: { Authorization: `Bearer ${token}` } });
            alert("Dose recorded successfully!");
        }
        
        setShowAdminForm(false);
        setSelectedMedForAdmin(null);
        setEditingAdminId(null);
        fetchData(); 
    } catch(err) {
        console.error(err);
        alert("Failed to record dose");
    }
  };
  
  const handleDeleteMedication = async (id) => {
      if(!confirm("Delete this medication order?")) return;
      const token = localStorage.getItem("token");
      try {
          await axios.delete(`https://admin-panel-backend-alpha.vercel.app/medications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          fetchData();
      } catch(err) {
          console.error(err); alert("Failed delete");
      }
  };

  const handleDeleteHistory = async (id) => {
      if(!confirm("Delete this administration record?")) return;
      const token = localStorage.getItem("token");
      try {
          await axios.delete(`https://admin-panel-backend-alpha.vercel.app/medication-administration/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          fetchData();
      } catch(err) {
          console.error(err); alert("Failed delete");
      }
  };

  const openAdminForm = (med) => {
      setSelectedMedForAdmin(med);
      setEditingAdminId(null);
      setAdminForm({ caregiverName: "", time: new Date().toTimeString().slice(0,5), given: "Yes", notes: "" });
      setShowAdminForm(true);
  };

  const handleEditAdmin = (record) => {
      setEditingAdminId(record._id);
      setSelectedMedForAdmin(record.medication && typeof record.medication === 'object' ? record.medication : { _id: record.medication, medicationName: record.medicationName });
      setAdminForm({
          caregiverName: record.caregiverName || "",
          time: record.time || "",
          given: record.given ? "Yes" : "No",
          notes: record.notes || ""
      });
      setShowAdminForm(true);
  };

  const handleEditMed = (med) => {
      setEditingId(med._id);
      setMedForm({
          medicationName: med.medicationName || "",
          frequency: med.schedule?.frequency || "", 
          times: med.schedule?.times?.join(", ") || "",
          stock: med.stock || { quantity: 0, threshold: 5 },
          status: med.status || "Pending"
      });
      setShowForm(true);
  }

  const handleView = (item, type) => {
    setViewItem(item);
    setViewType(type);
  };

  const closeView = () => {
    setViewItem(null);
    setViewType(null);
  };

  // PDF Export
  const handleDownloadPdf = async (item, type = 'order') => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    
    if(type === 'order') {
        doc.text("Medication Order Details", 14, 15);
        autoTable(doc, {
            startY: 25,
            body: [
                ["Medication", item.medicationName],
                ["Frequency", item.schedule?.frequency || "-"],
                ["Times", item.schedule?.times?.join(", ") || "-"],
                ["Stock", item.stock?.quantity],
                ["Status", item.status]
            ]
        });
    } else {
        doc.text("Administration Record", 14, 15);
        autoTable(doc, {
            startY: 25,
            body: [
                ["Date", item.date || new Date(item.createdAt).toLocaleDateString()],
                ["Time", item.time],
                ["Medication", item.medication?.medicationName || "Unknown"],
                ["Given", item.given ? "Yes" : "No"],
                ["Caregiver", item.caregiverName]
            ]
        });
    }
    doc.save(`Medication_${type}.pdf`);
  };

  return (
    <main className="flex-1 h-auto overflow-hidden">
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <h2 className="text-white text-base sm:text-lg md:text-xl flex items-center gap-2 leading-tight">
            <MdOutlineMedication className="w-5 h-5" />
            <span className="whitespace-normal"> Medication (eMAR) & Stock</span>
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
             <div className="flex bg-gray-700 rounded p-1 gap-1">
                 <button onClick={() => setActiveTab("active")} className={`px-3 py-1 rounded text-sm ${activeTab === "active" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-600"}`}>Active Orders</button>
                 <button onClick={() => setActiveTab("history")} className={`px-3 py-1 rounded text-sm ${activeTab === "history" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-600"}`}>History Log</button>
             </div>

            <button
              onClick={() => { 
                  setEditingId(null); 
                  setMedForm({ medicationName:"", frequency:"", times:"", stock:{quantity:0, threshold:5}, status: "Pending"}); 
                  setShowForm(true); 
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center gap-2 text-sm"
            >
              <FaPlus className="w-3 h-3" />
              <span className="whitespace-nowrap">New Order</span>
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="mb-8">
            {activeTab === "active" && (
                <>
                <h3 className="text-white font-semibold mb-3">Current Medications & Stock</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-[700px] w-full divide-y divide-gray-700 text-sm">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-gray-300">Medication</th>
                                <th className="px-4 py-3 text-left text-gray-300">Frequency</th>
                                <th className="px-4 py-3 text-left text-gray-300">Schedule Times</th>
                                <th className="px-4 py-3 text-left text-gray-300">Stock Level</th>
                                <th className="px-4 py-3 text-left text-gray-300">Status</th>
                                <th className="px-4 py-3 text-left text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {medications.length > 0 ? (
                                medications.map(m => (
                                    <tr key={m._id}>
                                        <td className="px-4 py-3 text-white font-medium">{m.medicationName}</td>
                                        <td className="px-4 py-3 text-white">{m.schedule?.frequency || "-"}</td>
                                        <td className="px-4 py-3 text-white">{m.schedule?.times?.join(", ") || "-"}</td>
                                        <td className="px-4 py-3 text-white">
                                            <span className={`px-2 py-1 rounded text-xs ${m.stock?.quantity <= m.stock?.threshold ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                                                {m.stock?.quantity || 0} left
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-white">{m.status}</td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button onClick={() => openAdminForm(m)} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs" title="Record Dose">Record Dose</button>
                                            <button onClick={() => handleEditMed(m)} className="text-yellow-400 hover:text-yellow-300"><FaEdit /></button>
                                            <button onClick={() => handleDeleteMedication(m._id)} className="text-red-400 hover:text-red-300"><FaTrash /></button>
                                            <button onClick={() => handleView(m, 'order')} className="text-blue-400 hover:text-blue-300" title="View Details"><FaEye /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No active medication orders found for this client.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </>
            )}

            {activeTab === "history" && (
                <>
                <h3 className="text-white font-semibold mb-3">Administration History (eMAR Log)</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-[700px] w-full divide-y divide-gray-700 text-sm">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-gray-300">Date/Time</th>
                                <th className="px-4 py-3 text-left text-gray-300">Medication</th>
                                <th className="px-4 py-3 text-left text-gray-300">Given?</th>
                                <th className="px-4 py-3 text-left text-gray-300">Caregiver</th>
                                <th className="px-4 py-3 text-left text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {adminHistory.length > 0 ? (
                                adminHistory.map(h => {
                                    // 🛠️ Med Name Lookup Fix (Improved)
                                    let medName = "Unknown";
                                    
                                    // 1. Try populated object
                                    if (h.medication && typeof h.medication === 'object' && h.medication.medicationName) {
                                        medName = h.medication.medicationName;
                                    } 
                                    // 2. Try lookup by ID in active list
                                    else if (h.medication) {
                                        const found = medications.find(m => m._id === h.medication || m._id === h.medication._id);
                                        if (found) {
                                            medName = found.medicationName;
                                        } else if (typeof h.medication === 'string') {
                                            // 3. Fallback: Use the string itself (it might be the name!)
                                            medName = h.medication;
                                        }
                                    }

                                    // 4. Last resort: check flat field
                                    if ((medName === "Unknown" || (medName.length === 24 && !medName.includes(" "))) && h.medicationName) {
                                         medName = h.medicationName;
                                    }

                                    // 🛠️ Date Format Fix
                                    const dateObj = h.date ? new Date(h.date) : new Date(h.createdAt);
                                    const dateStr = !isNaN(dateObj) ? dateObj.toLocaleDateString() : (h.date || "-");

                                    return (
                                    <tr key={h._id}>
                                        <td className="px-4 py-3 text-white">
                                            {dateStr} <span className="text-gray-400 text-xs ml-2">{h.time}</span>
                                        </td>
                                        <td className="px-4 py-3 text-white">{medName}</td>
                                        <td className="px-4 py-3 text-white">
                                            {h.given ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}
                                        </td>
                                        <td className="px-4 py-3 text-white">{h.caregiverName}</td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button onClick={() => handleDeleteHistory(h._id)} className="text-red-400 hover:text-red-300"><FaTrash /></button>
                                            <button onClick={() => handleView(h, 'history')} className="text-blue-400 hover:text-blue-300" title="View Details"><FaEye /></button>
                                        </td>
                                    </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No administration history found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </>
            )}
        </div>

        {/* MODAL: New/Edit Order */}
        {showForm && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 w-full max-w-lg rounded-lg p-6 relative">
                    <h2 className="text-white text-xl font-bold mb-4">{editingId ? "Edit Order" : "New Medication Order"}</h2>
                    <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FaTimes /></button>
                    <form onSubmit={handleCreateMedication} className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-sm">Medication Name</label>
                            <input type="text" value={medForm.medicationName} onChange={e=>setMedForm({...medForm, medicationName: e.target.value})} className="w-full bg-gray-700 text-white rounded p-2" required placeholder="e.g. Paracetamol" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-400 text-sm">Frequency</label>
                                <input type="text" value={medForm.frequency} onChange={e=>setMedForm({...medForm, frequency: e.target.value})} className="w-full bg-gray-700 text-white rounded p-2" placeholder="e.g. Daily" />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Times (comma separated)</label>
                                <input type="text" value={medForm.times} onChange={e=>setMedForm({...medForm, times: e.target.value})} className="w-full bg-gray-700 text-white rounded p-2" placeholder="e.g. 08:00, 20:00" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-400 text-sm">Initial Stock</label>
                                <input type="number" value={medForm.stock.quantity} onChange={e=>setMedForm({...medForm, stock: {...medForm.stock, quantity: parseInt(e.target.value)||0}})} className="w-full bg-gray-700 text-white rounded p-2" />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Low Stock Alert</label>
                                <input type="number" value={medForm.stock.threshold} onChange={e=>setMedForm({...medForm, stock: {...medForm.stock, threshold: parseInt(e.target.value)||0}})} className="w-full bg-gray-700 text-white rounded p-2" />
                            </div>
                        </div>
                        <div>
                             <label className="text-gray-400 text-sm">Status</label>
                             <select value={medForm.status} onChange={e=>setMedForm({...medForm, status: e.target.value})} className="w-full bg-gray-700 text-white rounded p-2">
                                 <option value="Pending">Pending</option>
                                 <option value="Active">Active</option>
                                 <option value="Completed">Completed</option>
                             </select>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded mt-2">Save Order</button>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL: Record Dose */}
        {showAdminForm && selectedMedForAdmin && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 w-full max-w-md rounded-lg p-6 relative">
                    <h2 className="text-white text-xl font-bold mb-4">{editingAdminId ? "Edit Dose Record" : "Record Dose"}</h2>
                    <p className="text-indigo-300 mb-4 text-sm">Recording for: {selectedMedForAdmin?.medicationName || "Medication"}</p>
                    <button onClick={() => setShowAdminForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FaTimes /></button>
                    <form onSubmit={handleRecordDose} className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-sm">Caregiver Name</label>
                            <input type="text" value={adminForm.caregiverName} onChange={e=>setAdminForm({...adminForm, caregiverName: e.target.value})} className="w-full bg-gray-700 text-white rounded p-2" placeholder="Your name" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Time</label>
                            <input type="time" value={adminForm.time} onChange={e=>setAdminForm({...adminForm, time: e.target.value})} className="w-full bg-gray-700 text-white rounded p-2" required />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Was it given?</label>
                            <select value={adminForm.given} onChange={e=>setAdminForm({...adminForm, given: e.target.value})} className="w-full bg-gray-700 text-white rounded p-2">
                                <option value="Yes">Yes, Given</option>
                                <option value="No">No, Not Given</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Notes</label>
                            <textarea value={adminForm.notes} onChange={e=>setAdminForm({...adminForm, notes: e.target.value})} className="w-full bg-gray-700 text-white rounded p-2" rows="2"></textarea>
                        </div>
                        <div className="text-xs text-yellow-500">
                            * Recording as &quot;Given&quot; will automatically deduct 1 from stock.
                        </div>
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-2">Confirm Dose</button>
                    </form>
                </div>
            </div>
        )}

        {/* VIEW MODAL (Syced with PBS style) */}
        {viewItem && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-2xl rounded-lg p-6 shadow-lg overflow-y-auto max-h-[90vh]"
              style={{ backgroundColor: "#111827", color: "#ffffff" }}
            >
              <h2 className="text-2xl font-semibold mb-6">
                {viewType === 'order' ? 'Medication Order' : 'Administration Record'} Details
              </h2>

              <div className="space-y-4 text-sm">
                {viewType === 'order' ? (
                  <>
                    <div>
                      <strong>Medication Name:</strong>
                      <p className="bg-gray-800 p-3 rounded mt-1">{viewItem.medicationName}</p>
                    </div>
                    <div>
                      <strong>Frequency:</strong>
                      <p className="bg-gray-800 p-3 rounded mt-1">{viewItem.schedule?.frequency || "N/A"}</p>
                    </div>
                    <div>
                      <strong>Scheduled Times:</strong>
                      <p className="bg-gray-800 p-3 rounded mt-1">{viewItem.schedule?.times?.join(", ") || "N/A"}</p>
                    </div>
                    <div>
                      <strong>Current Stock:</strong>
                      <p className="bg-gray-800 p-3 rounded mt-1">{viewItem.stock?.quantity || 0} units left</p>
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <p className="bg-gray-800 p-3 rounded mt-1">{viewItem.status || "Pending"}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <strong>Date / Time:</strong>
                      <p className="bg-gray-800 p-3 rounded mt-1">
                        {new Date(viewItem.date || viewItem.createdAt).toLocaleDateString()} at {viewItem.time}
                      </p>
                    </div>
                    <div>
                        <strong>Medication:</strong>
                        <p className="bg-gray-800 p-3 rounded mt-1">
                            {viewItem.medication?.medicationName || viewItem.medicationName || "Unknown"}
                        </p>
                    </div>
                    <div>
                      <strong>Was Given?</strong>
                      <p className={`bg-gray-800 p-3 rounded mt-1 ${viewItem.given ? 'text-green-400' : 'text-red-400'}`}>
                        {viewItem.given ? "Yes, Administered" : "No, Not Administered"}
                      </p>
                    </div>
                    <div>
                      <strong>Caregiver Name:</strong>
                      <p className="bg-gray-800 p-3 rounded mt-1">{viewItem.caregiverName || "N/A"}</p>
                    </div>
                    {viewItem.notes && (
                      <div>
                        <strong>Notes:</strong>
                        <p className="bg-gray-800 p-3 rounded mt-1 whitespace-pre-wrap">{viewItem.notes}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Timestamps */}
                {viewItem.createdAt && (
                  <div>
                    <strong>Created:</strong>
                    <p className="bg-gray-800 p-3 rounded mt-1">
                      {new Date(viewItem.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 flex-wrap">
                <button
                  onClick={closeView}
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 text-sm"
                >
                  Close
                </button>

                <button
                  onClick={() => window.print()}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-sm"
                >
                  Print
                </button>

                <button
                  onClick={() => handleDownloadPdf(viewItem, viewType)}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-sm"
                >
                  Export as PDF
                </button>

                {viewType === 'order' && (
                    <>
                        <button
                        onClick={() => {
                            handleDeleteMedication(viewItem._id);
                            closeView();
                        }}
                        className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-sm"
                        >
                        Delete Order
                        </button>

                        <button
                        onClick={() => {
                            handleEditMed(viewItem);
                            closeView();
                        }}
                        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-sm"
                        >
                        Edit Order
                        </button>
                    </>
                )}

                {viewType === 'history' && (
                    <>
                        <button
                        onClick={() => {
                            handleDeleteHistory(viewItem._id);
                            closeView();
                        }}
                        className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-sm"
                        >
                        Delete Record
                        </button>

                        <button
                        onClick={() => {
                            handleEditAdmin(viewItem);
                            closeView();
                        }}
                        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-sm"
                        >
                        Edit Record
                        </button>
                    </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default ResidentProfileMedicationEMAR;

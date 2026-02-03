"use client";

import { useState, useCallback, useEffect } from "react";
import { FiPlus, FiCalendar, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import React from "react";
import FullRotaCalendar from "@/app/(component)/fullrotacalendar/FullRotaCalendar";
// ---- FIX FOR ERROR 1 ----
const FieldBlockComponent = ({ label, type, value, onChange }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#2d3b4e] border-l-4 border-[#5A58C9] rounded-r p-2 text-white text-sm"
      />
    </div>
  );
};

const FieldBlock = React.memo(FieldBlockComponent);

// ---- FIX FOR ERROR 2 ----

export default function RotaCalendar({ staffId }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "shift",
    start: "09:00",
    end: "17:00",
    location: "Client Z Residence",
    resident: "Mr. Smith",
    rate: "15.50",
    hours: "8.0",
  });
  const [showForm, setShowForm] = useState(false);
  const [shifts, setShifts] = useState([]);

  const handleChange = useCallback((key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Calculate hours dynamically
 useEffect(() => {
  if (form.start && form.end) {
    const [startH, startM] = form.start.split(":").map(Number);
    const [endH, endM] = form.end.split(":").map(Number);

    let totalHours = endH + endM / 60 - (startH + startM / 60);
    if (totalHours < 0) totalHours += 24;

    handleChange("hours", totalHours.toFixed(2));
  }
}, [form.start, form.end, handleChange]);


  // Fetch shifts from backend
 

// Fetch shifts for this staff
  useEffect(() => {
    if (!staffId) return;

    const fetchShifts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/shifts/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setShifts(data);
      } catch (err) {
        console.error("Failed to fetch shifts:", err);
      }
    };
    fetchShifts();
  }, [staffId]);




const saveShift = async () => {
  if (!form.date) {
    toast.error("Please select a date!");
    return;
  }

  try {
    const res = await fetch("https://admin-panel-backend-alpha.vercel.app/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, staff: staffId }), // include staffId
    });

    if (!res.ok) throw new Error("Failed to save shift");

    const newShift = await res.json();
    setShifts((prev) => [...prev, newShift]);
    setShowForm(false);
    toast.success(form.type === "dayoff" ? "Day Off added!" : "Shift added!");
  } catch (err) {
    toast.error(err.message);
  }
};


  const deleteShift = async (id) => {
    if (!confirm("Are you sure you want to delete this shift/day off?")) return;

    try {
      const res = await fetch(`https://admin-panel-backend-alpha.vercel.app/shifts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete shift");

      setShifts((prev) => prev.filter((s) => s._id !== id));
      toast.info("Shift/Day Off deleted!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const EditableField = ({ label, value }) => (
    <div className="mb-4">
      <label className="block text-sm sm:text-sm md:text-base text-gray-400 mb-1">
        {label}
      </label>
      <div className="bg-[#2d3b4e] border-l-4 border-[#5A58C9] rounded-r p-2 text-white">
        {value}
      </div>
    </div>
  );

  const calculateRotaPattern = (shifts) => {
    const on = shifts.filter((s) => s.type === "shift").length;
    const off = shifts.filter((s) => s.type === "dayoff").length;
    return `${on || 0} On / ${off || 0} Off`;
  };

  const calculateNextDayOff = (shifts) => {
    const nextOff = shifts.find((s) => s.type === "dayoff");
    if (!nextOff) return "MM-DD-YYYY";
    return new Date(nextOff.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateShiftAllocation = (shifts) => {
    const shiftLocations = shifts
      .filter((s) => s.type === "shift")
      .map((s) => s.location);
    return shiftLocations.length > 0
      ? shiftLocations.join(", ")
      : "No shifts scheduled";
  };

  return (
    <div className="bg-[#243041] rounded-lg shadow p-3 sm:p-4 md:p-6 mb-6 h-full overflow-y-auto text-white">
      <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold mb-4">
        Current and Upcoming Rota
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <EditableField label="Primary Rota Pattern:" value={calculateRotaPattern(shifts)} />
        <EditableField label="Next Scheduled Day Off:" value={calculateNextDayOff(shifts)} />
        <EditableField label="Shift Allocation:" value={calculateShiftAllocation(shifts)} />
      </div>

      <div className="border border-gray-500 rounded p-3 bg-[#1f2937] mt-4">
        <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold mb-3">
          🗓️ Allocate New Shift
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center cursor-pointer gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded shadow w-full sm:w-auto text-[10px] sm:text-xs md:text-sm"
          >
            <FiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Allocate New Shift
          </button>

          <button
            onClick={() => setShowCalendar((prev) => !prev)}
            className="bg-[#4A49B0] hover:bg-[#5e5dd8] cursor-pointer text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FiCalendar className="w-4 h-4" />
            View Full Rota Calendar
          </button>
        </div>

        {showForm && (
          <div className="border border-gray-700 rounded p-4 bg-[#1f2937] mt-2 space-y-4">
            <h4 className="text-red-400 font-semibold text-sm sm:text-base md:text-lg mb-2">
              Shift Entry Form (Simulated for Day)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FieldBlock label="Select Date:" type="date" value={form.date} onChange={(v) => handleChange("date", v)} />
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Shift Type:</label>
                <select
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full bg-[#2d3b4e] border-l-4 border-[#5A58C9] rounded-r p-2 text-white text-sm"
                >
                  <option value="shift">Shift</option>
                  <option value="dayoff">Day Off</option>
                </select>
              </div>
            </div>

            {form.type === "shift" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <FieldBlock label="Start Time:" type="time" value={form.start} onChange={(v) => handleChange("start", v)} />
                  <FieldBlock label="End Time:" type="time" value={form.end} onChange={(v) => handleChange("end", v)} />
                  <FieldBlock label="Location:" type="text" value={form.location} onChange={(v) => handleChange("location", v)} />
                  <FieldBlock label="Resident Name:" type="text" value={form.resident} onChange={(v) => handleChange("resident", v)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldBlock label="Hourly Rate:" type="text" value={form.rate} onChange={(v) => handleChange("rate", v)} />
                  <FieldBlock label="Total Hours:" type="text" value={form.hours} onChange={() => {}} />
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                onClick={saveShift}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-medium text-sm shadow"
              >
                Save Shift
              </button>

              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white font-medium text-sm shadow"
              >
                Clear Form
              </button>
            </div>
          </div>
        )}
      </div>

      {shifts.length > 0 && (
        <div className="overflow-x-auto bg-[#1f2937] border border-gray-500 rounded p-3 mt-4">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="px-2 py-1">Date</th>
                <th className="px-2 py-1">Day</th>
                <th className="px-2 py-1">Shift/Hours</th>
                <th className="px-2 py-1">Location</th>
                <th className="px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s, i) => {
                const date = new Date(s.date);
                const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                return (
                  <tr
                    key={i}
                    className={`border-b border-gray-700 ${s.type === "dayoff" ? "bg-red-600/20" : ""}`}
                  >
                    <td className="px-2 py-1">{monthDay}</td>
                    <td className="px-2 py-1">{dayName}</td>
                    <td className="px-2 py-1">
                      {s.type === "dayoff" ? "DAY OFF" : `${s.start} - ${s.end} (${s.hours}h)` }
                    </td>
                    <td className="px-2 py-1">{s.type === "shift" ? s.location : ""}</td>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => deleteShift(s._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs flex items-center justify-center"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCalendar && (
        <FullRotaCalendar
          shifts={shifts}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}

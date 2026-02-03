# 📈 Performance Management - Documentation

## 1. 📌 Overview

The **Performance Management Module** supports long-term quality control by tracking staff appraisals, supervisions, and key performance indicators (KPIs). It ensures that regular reviews are conducted and recorded efficiently.

### ✅ Key Features
*   **Appraisal Tracking:** Log supervisions, quarterly appraisals, and annual reviews.
*   **Reminder System:** Set "Scheduled Reminder Dates" to receive automated system alerts when a review is due.
*   **KPI Monitoring:** Record specific Objectives and Key Performance Indicators for each staff member.
*   **Feedback Storage:** Securely store detailed feedback notes for future reference.

---

## 2. 🚀 Quick Start Guide

### ➕ Recording a Performance Review
1.  Navigate to **Performance Management**.
2.  Click **"Add Record"**.
3.  **Select Staff:** Choose the employee being reviewed.
4.  **Enter Details:**
    *   **Supervisions:** (e.g., "Monthly 1-on-1 completed")
    *   **Appraisals:** (e.g., "Annual Review 2025")
    *   **Objectives:** Set goals for the next period.
    *   **Feedback:** Enter qualitative feedback.
5.  **Set Reminder:** Choose a date for the *next* review to ensure it isn't missed.
6.  **Save.**

### 🔔 Handling Reminders
*   The system runs a background check every 5 minutes (and on load).
*   If a reminder date is reached, a **Toast Notification** will appear: *"🔔 Reminder due for: [Staff Name]"*.
*   Use the **"Upcoming"** or **"Overdue"** filters to plan your review schedule.

---

## 3. 🔌 API Reference

### Base URL: `https://admin-panel-backend-alpha.vercel.app/performance`

### Endpoints
*   **GET** `/` - List all records.
*   **POST** `/` - Create new appraisal record.
*   **GET** `/reminders/due` - Special endpoint to fetch records where `appraisalReminderDate` is today or past.

### Data Model
```javascript
{
  staff: ObjectId (ref: "HR"),
  supervisions: String,
  appraisals: String,
  objectivesKpi: String,
  feedbackNotes: String,
  appraisalReminderDate: Date
}
```

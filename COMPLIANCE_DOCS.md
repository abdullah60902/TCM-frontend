# ⚖️ Compliance Module - Documentation

## 1. 📌 Overview

The **Compliance Module** provides a structured way to manage regulatory requirements, governance, and audit readiness. It allows administrators to track compliance tasks, schedule reviews, and maintain a visible record of adherence to standards.

### ✅ Key Features
*   **Requirement Tracking:** Log specific regulations or internal standards (e.g., "Wound Care Protocols").
*   **Review Scheduling:** Set "Last Review" and "Next Review" dates to ensure continuous governance.
*   **Status Indicators:** Mark items as "Compliant", "Action Required", or "Upcoming".
*   **Evidence Storage:** Attach proof of compliance (documents, images, videos) directly to the record.
*   **Visibility Control:** Tag records for specific visibility levels (e.g., "Internal Only" vs "Auditor Access").

---

## 2. 🚀 Quick Start Guide

### ➕ Adding a Compliance Record
1.  Navigate to **Compliance**.
2.  Click **"Add Compliance"** (or similar button).
3.  **Fill Details:**
    *   **Requirement:** Name of the standard.
    *   **Category:** (e.g., "Nursing", "Health & Safety").
    *   **Dates:** Enter review cycle dates.
    *   **Status:** Current state.
    *   **Visibility:** Define who can see this record.
4.  **Attach Evidence:** Upload PDF reports or photo evidence.
5.  **Save.**

### 🔍 Audit Preparation
*   **Filter:** Use the "Action Required" filter to see what needs immediate attention before an inspection.
*   **Export:** Use the **Download Button** to generate a "Compliance Report" PDF or CSV for the auditor.

---

## 3. 🔌 API Reference

### Base URL: `https://admin-panel-backend-alpha.vercel.app/compliance`

### Endpoints
*   **GET** `/` - Fetch all records.
*   **POST** `/` - Create new record (Multipart/FormData).
*   **PUT** `/:id` - Update status or attach new evidence.
*   **DELETE** `/:id` - Remove obsolete records.

### Audit Integration
*   Changes made in this module are logged and visible in the **Analytics Module** under "Compliance Audit Logs" for full accountability.

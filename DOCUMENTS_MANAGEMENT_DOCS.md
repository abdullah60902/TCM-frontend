# 📂 Documents Management - Documentation

## 1. 📌 Overview

The **Documents Management** module acts as a central repository for all critical operational and compliance files. It provides a robust interface for uploading, categorizing, and monitoring the expiration status of essential documents.

### ✅ Key Features
*   **Centralized Storage:** Store contracts, DBS certificates, ID proofs, and policy documents in one place.
*   **Expiry Tracking:** Automatically highlights documents that are **"Expiring Soon"** (Yellow) or **"Expired"** (Red).
*   **Smart Filtering:** Quickly toggle views between Valid, Expiring, and Expired records.
*   **Visual Previews:** Built-in PDF viewer, Image previewer, and Video player for immediate access without downloading.

---

## 2. 🚀 Quick Start Guide

### 📤 Uploading a Document
1.  Go to **Documents Management**.
2.  Click **"Add Record"** (or similar button).
3.  **Select Staff:** Link the document to a specific employee.
4.  **Upload Files:**
    *   Categories: Employment Contracts, DBS, IDs, Training Certs, Appraisals.
    *   Format: Supports PDF, JPG, PNG, MP4.
5.  **Set Expiry:** Critical for compliance tracking.
6.  **Save.**

### 🔍 Monitoring Compliance
*   **Dashboard Alerts:** Inspect the top of the list for any Red (Expired) items.
*   **Toast Notifications:** Upon login, the system will auto-alert you: *"⚠️ Expired: John Doe"* or *"ℹ️ Expiring Soon: Jane Smith"*.
*   **Filter:** Use the "Expiring Soon" button to prioritize renewals for the coming month.

---

## 3. 🔌 API Reference

### Base URL: `https://admin-panel-backend-alpha.vercel.app/staff-documents`

### Key Endpoints
*   **GET** `/` - Fetch all document records.
*   **POST** `/` - Upload new documents (Multipart/FormData).
*   **PUT** `/:id` - Update expiry dates or add new attachments.
*   **DELETE** `/:id` - Remove obsolete records.

### Implementation Logic
*   **Expiry Calculation:**
    ```javascript
    const diffInDays = (expiry - now) / (1000 * 60 * 60 * 24);
    if (expiry < now) status = "Expired";
    else if (diffInDays <= 30) status = "Expiring Soon";
    ```
*   **File Handling:** Supports multiple file uploads per category using `FormData`.

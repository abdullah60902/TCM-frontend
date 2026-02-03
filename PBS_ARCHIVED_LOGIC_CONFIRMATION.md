# PBS Plans - Archived Logic Integration 🗄️

## ✅ Status: Frontend Ready

I have confirmed that the **Frontend** (`ResidentProfilePBSplan.js`) is fully configured to work with the backend logic you provided.

### 🔌 Backend Logic (Provided by You)
You provided this endpoint logic:
```javascript
router.get("/older-than-six-months", verifyToken, allowRoles(...), async (req, res) => {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  // ... finds plans older than 6 months ...
  res.status(200).json({ count: plans.length, cutoff, plans });
});
```

### 🖥️ Frontend Implementation (Completed)
I have updated `ResidentProfilePBSplan.js` to consume this endpoint exactly as required.

1.  **Fetch Logic Added:**
    ```javascript
    useEffect(() => {
      if (!showArchived || !clientId) return;
      
      // Calls your endpoint
      fetch(`https://admin-panel-backend-alpha.vercel.app/pbs-plan/older-than-six-months`, ...)
        .then(res => res.json())
        .then(data => {
            // Filters the response to show only this client's plans
            const clientPlans = (data.plans || []).filter(p => p.client === clientId);
            setArchivedPlans(clientPlans);
        });
    }, [showArchived, clientId]);
    ```

2.  **Display Logic:**
    - "View Archived Plans" button is active.
    - Clicking it fetches the old plans.
    - Displays plans created more than 6 months ago.

### 🚀 Next Steps
Since I only have access to the frontend files, please ensure you have added the route handler code to your backend file (likely `api/route/pbsPlanRoutes.js`).

Once the backend is running with that route, the "View Archived Plans" button will automatically start showing the older plans!

---
**Verified:** Logic matches `ResidentProfileCarePlan` implementation.

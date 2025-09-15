
import React, { useState } from "react";
import Login from "./components/Login";
import NotesList from "./components/NotesList";
import NoteForm from "./components/NoteForm";
import API from "./api";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const fetchNotes = () => setRefresh((r) => r + 1);

  const upgradePlan = async () => {
    try {
      await API.post(`/tenants/${user.tenant.toLowerCase()}/upgrade`);
      alert("Upgraded to Pro plan");
    } catch (err) {
      alert(err.response?.data?.message || "Upgrade failed");
    }
  };

  if (!user) return <Login setUser={setUser} />;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Welcome, {user.role}</h1>
        <div className="app-buttons">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              setUser(null);
            }}
          >
            Logout
          </button>
          <button className="upgrade-btn" onClick={upgradePlan}>
            Upgrade to Pro
          </button>
        </div>
      </header>

      <main className="app-main">
        <NoteForm fetchNotes={fetchNotes} />
        <NotesList key={refresh} user={user} />
      </main>
    </div>
  );
}

export default App;







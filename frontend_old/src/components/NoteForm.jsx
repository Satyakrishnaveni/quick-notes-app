import React, { useState } from "react";
import API from "../api";

const NoteForm = ({ fetchNotes }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const addNote = async (e) => {
    e.preventDefault();
    try {
      await API.post("/notes", { title, content });
      setTitle(""); setContent("");
      fetchNotes();
    } catch(err) {
      setError(err.response?.data?.message || "Add note failed");
    }
  };

  return (
    <div>
      {error && <p style={{color:"red"}}>{error}</p>}
      <form onSubmit={addNote}>
        <input type="text" placeholder="Title" value={title} 
               onChange={e=>setTitle(e.target.value)} required />
        <input type="text" placeholder="Content" value={content} 
               onChange={e=>setContent(e.target.value)} />
        <button type="submit">Add Note</button>
      </form>
    </div>
  );
};

export default NoteForm;

import React, { useEffect, useState } from "react";
import API from "../api";

const NotesList = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch(err) {
      setError(err.response?.data?.message || "Error fetching notes");
    }
  };

  const deleteNote = async (id) => {
    try {
      await API.delete(`/notes/${id}`);
      fetchNotes();
    } catch(err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  return (
    <div>
      <h2>{user.tenant} Notes</h2>
      {error && <p style={{color:"red"}}>{error}</p>}
      <ul>
        {notes.map(note => (
          <li key={note._id}>
            <strong>{note.title}</strong> - {note.content}
            <button onClick={()=>deleteNote(note._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotesList;

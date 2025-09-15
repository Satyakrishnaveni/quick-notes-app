const Note = require("../models/Note");

const createNote = async (req, res) => {
  try {
    const tenant = req.user.tenant;
    if(tenant.plan === "Free") {
      const count = await Note.countDocuments({ tenant: tenant._id });
      if(count >= 3) return res.status(403).json({ message: "Free plan limit reached. Upgrade to Pro." });
    }

    const note = await Note.create({
      title: req.body.title,
      content: req.body.content,
      tenant: tenant._id,
      createdBy: req.user._id
    });
    res.status(201).json(note);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

const getNotes = async (req,res) => {
  const notes = await Note.find({ tenant: req.user.tenant._id });
  res.json(notes);
};

const getNote = async (req,res) => {
  const note = await Note.findOne({ _id: req.params.id, tenant: req.user.tenant._id });
  if(!note) return res.status(404).json({ message:"Note not found" });
  res.json(note);
};

const updateNote = async (req,res) => {
  const note = await Note.findOne({ _id: req.params.id, tenant: req.user.tenant._id });
  if(!note) return res.status(404).json({ message:"Note not found" });
  note.title = req.body.title || note.title;
  note.content = req.body.content || note.content;
  await note.save();
  res.json(note);
};

const deleteNote = async (req,res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, tenant: req.user.tenant._id });
  if(!note) return res.status(404).json({ message:"Note not found" });
  res.json({ message: "Note deleted" });
};

module.exports = { createNote, getNotes, getNote, updateNote, deleteNote };

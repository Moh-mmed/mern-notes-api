const Note = require("../models/noteModel");
const factory = require("./handlerFactory");


exports.getAllNotes = factory.getAll(Note, 'user');
exports.createNote = factory.createOne(Note);
exports.getNote = factory.getOne(Note, 'user');
exports.updateNote = factory.updateOne(Note);
exports.deleteNote = factory.deleteOne(Note);
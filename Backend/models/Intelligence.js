const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  source: String,
  title: String,
  description: String,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number] // [lng, lat]
  },
  mediaUrl: String,
  tags: [String],
});

schema.index({ location: "2dsphere" });

module.exports = mongoose.model("Intelligence", schema);

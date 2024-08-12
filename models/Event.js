const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  petId: { type: Schema.Types.ObjectId, ref: "Pet", required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  eventDate: {
    type: String, // Store the date as a string in the desired format
    required: true,
  },
});

module.exports = mongoose.model("Event", EventSchema);

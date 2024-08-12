const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PetSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User model
  profilePhoto: { type: Buffer }, // Store the image as binary data (Buffer)
  growthLog: [
    {
      date: { type: Date, default: Date.now },
      weight: { type: Number },
      height: { type: Number },
      note: { type: String },
      measureDate: { type: String },
    },
  ],
  dateAdded: { type: Date, default: Date.now },
  category: { type: String, required: true }, // cats, dogs or other
});

module.exports = mongoose.model("Pet", PetSchema);

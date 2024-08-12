const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  petId: { type: Schema.Types.ObjectId, ref: "Pet", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  image: [{ type: Buffer }], // Array of binary data (Buffer) for photos
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);

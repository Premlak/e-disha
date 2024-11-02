import mongoose from "mongoose";

const mopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MOP = mongoose.models.MOP || mongoose.model("MOP", mopSchema);
export default MOP;

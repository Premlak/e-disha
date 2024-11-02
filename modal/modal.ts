import mongoose from "mongoose";

const modalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Modal = mongoose.models.Modal || mongoose.model("Modal", modalSchema);
export default Modal;

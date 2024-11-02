import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
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

const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
export default Brand;

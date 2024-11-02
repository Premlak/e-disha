import mongoose from "mongoose";

// Create a separate schema for the counter
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

// Create or get the counter model
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const vendorSchema = new mongoose.Schema({
  vendorId: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{10}$/.test(v);
      },
      message: "Mobile number must be 10 digits"
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to auto-increment vendorId
vendorSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'vendorId',
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      this.vendorId = counter.seq;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
export default Vendor;

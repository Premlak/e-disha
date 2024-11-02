import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{10}$/.test(v);
      },
      message: "Mobile number must be 10 digits"
    }
  },
  address: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

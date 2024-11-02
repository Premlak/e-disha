import mongoose, { Schema, Document } from 'mongoose';
export interface IAdmin extends Document {
  adminId: string;
  password: string;
}
const AdminSchema: Schema = new Schema({
  adminId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });
export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

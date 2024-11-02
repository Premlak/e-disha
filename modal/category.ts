import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  type: string;
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['consumable', 'non-consumable'],
    required: true
  }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ISubCategory extends Document {
  name: string;
  categoryId: mongoose.Types.ObjectId;
}

const SubCategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
}, { timestamps: true });

export default mongoose.models.SubCategory || mongoose.model<ISubCategory>('SubCategory', SubCategorySchema);

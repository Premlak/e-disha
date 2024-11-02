import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  modal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Modal',
    required: true
  },
  mop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MOP',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  serialNumber: {
    type: String,
    required: true
  },
  productNumber: {
    type: String,
    required: true
  },
  billNumber: {
    type: String,
    required: true
  },
  billDate: {
    type: Date,
    required: true
  },
  issued: {
    type: Boolean,
    default: false
  },
  issuedDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;

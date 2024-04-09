import { Schema, model } from "mongoose";

const ProductCategoriesSchema = new Schema(
  {
    title: { type: String, required: true },
  },
  { timestamps: true }
);

const ProductCategories = model("ProductCategories", ProductCategoriesSchema);
export default ProductCategories;

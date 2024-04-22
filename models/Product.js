import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    photo: { type: String, required: false },
    status: {
      type: String,
      enum: ["in-stock", "out-of-stock"],
      default: "in-stock",
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product = model("Product", ProductSchema);
export default Product;

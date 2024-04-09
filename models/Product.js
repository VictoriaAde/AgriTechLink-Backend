import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    caption: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    body: { type: Object, required: true },
    photo: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    tags: { type: [String] },
    categories: [{ type: Schema.Types.ObjectId, ref: "ProductCategories" }],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

ProductSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "product",
});

const Product = model("Product", ProductSchema);
export default Product;

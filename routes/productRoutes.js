import express from "express";
const router = express.Router();
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controllers/productControllers";
import { authGuard, adminGuard } from "../middleware/authMiddleware";

router
  .route("/")
  .post(authGuard, adminGuard, createProduct)
  .get(getAllProducts);
router
  .route("/:slug")
  .put(authGuard, adminGuard, updateProduct)
  .delete(authGuard, adminGuard, deleteProduct)
  .get(getProduct);

export default router;

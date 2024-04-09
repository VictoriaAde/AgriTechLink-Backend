import express from "express";
const router = express.Router();
import {
  createProductCategory,
  deleteProductCategory,
  getAllProductCategories,
  updateProductCategory,
  getSingleCategory,
} from "../controllers/productCategoriesController";
import { adminGuard, authGuard } from "../middleware/authMiddleware";

router
  .route("/")
  .post(authGuard, adminGuard, createProductCategory)
  .get(getAllProductCategories);

router
  .route("/:productCategoryId")
  .get(getSingleCategory)
  .put(authGuard, adminGuard, updateProductCategory)
  .delete(authGuard, adminGuard, deleteProductCategory);

export default router;

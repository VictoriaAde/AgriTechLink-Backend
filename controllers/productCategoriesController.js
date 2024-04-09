import ProductCategories from "../models/ProductCategories";
import Product from "../models/Product";

const createProductCategory = async (req, res, next) => {
  try {
    const { title } = req.body;

    const productCategory = await ProductCategories.findOne({ title });

    if (productCategory) {
      const error = new Error("Category is already created!");
      return next(error);
    }

    const newProductCategory = new ProductCategories({
      title,
    });

    const savedProductCategory = await newProductCategory.save();

    return res.status(201).json(savedProductCategory);
  } catch (error) {
    next(error);
  }
};

const getSingleCategory = async (req, res, next) => {
  try {
    const productCategory = await ProductCategories.findById(
      req.params.productCategoryId
    );

    if (!productCategory) {
      const error = new Error("Category was not found!");
      return next(error);
    }

    return res.json(productCategory);
  } catch (error) {
    next(error);
  }
};

const getAllProductCategories = async (req, res, next) => {
  try {
    const filter = req.query.searchKeyword;
    let where = {};
    if (filter) {
      where.title = { $regex: filter, $options: "i" };
    }
    let query = ProductCategories.find(where);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;
    const total = await ProductCategories.find(where).countDocuments();
    const pages = Math.ceil(total / pageSize);

    res.header({
      "x-filter": filter,
      "x-totalcount": JSON.stringify(total),
      "x-currentpage": JSON.stringify(page),
      "x-pagesize": JSON.stringify(pageSize),
      "x-totalpagecount": JSON.stringify(pages),
    });

    if (page > pages) {
      return res.json([]);
    }

    const result = await query
      .skip(skip)
      .limit(pageSize)
      .sort({ updatedAt: "desc" });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateProductCategory = async (req, res, next) => {
  try {
    const { title } = req.body;

    const productCategory = await ProductCategories.findByIdAndUpdate(
      req.params.productCategoryId,
      {
        title,
      },
      {
        new: true,
      }
    );

    if (!productCategory) {
      const error = new Error("Category was not found");
      return next(error);
    }

    return res.json(productCategory);
  } catch (error) {
    next(error);
  }
};

const deleteProductCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.productCategoryId;

    await Product.updateMany(
      { categories: { $in: [categoryId] } },
      { $pull: { categories: categoryId } }
    );

    await ProductCategories.deleteOne({ _id: categoryId });

    res.send({
      message: "Product category is successfully deleted!",
    });
  } catch (error) {
    next(error);
  }
};

export {
  createProductCategory,
  getAllProductCategories,
  updateProductCategory,
  deleteProductCategory,
  getSingleCategory,
};

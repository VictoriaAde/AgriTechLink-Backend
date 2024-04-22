import { uploadPicture } from "../middleware/uploadPictureMiddleware";
import Product from "../models/Product";
import { fileRemover } from "../utils/fileRemover";
import { v4 as uuidv4 } from "uuid";

const createProduct = async (req, res, next) => {
  try {
    const { title, description, price } = req.body;
    const product = new Product({
      title,
      description,
      price,
      photo: req.file ? req.file.filename : "",
      user: req.user._id,
    });
    const createdProduct = await product.save();
    return res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      const error = new Error("Product was not found");
      next(error);
      return;
    }

    const upload = uploadPicture.single("productPicture");

    const handleUpdateProductData = async (data) => {
      const { title, description, price, status } = JSON.parse(data);
      product.title = title || product.title;
      product.description = description || product.description;
      product.price = price || product.price;
      product.status = status || product.status;

      if (req.file) {
        // If a new photo is uploaded, remove the old one and update with the new filename
        fileRemover(product.photo);
        product.photo = req.file.filename;
      }

      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    };

    upload(req, res, async function (err) {
      if (err) {
        const error = new Error(
          "An unknown error occurred when uploading " + err.message
        );
        next(error);
      } else {
        // Everything went well
        if (req.file) {
          let filename;
          filename = product.photo;
          if (filename) {
            fileRemover(filename);
          }
          product.photo = req.file.filename;
          handleUpdateProductData(req.body.document);
        } else {
          let filename;
          filename = product.photo;
          product.photo = "";
          fileRemover(filename);
          handleUpdateProductData(req.body.document);
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ slug: req.params.slug });

    if (!product) {
      const error = new Error("Product was not found");
      return next(error);
    }

    // If product photo exists, remove it
    if (product.photo) {
      fileRemover(product.photo);
    }

    return res.json({
      message: "Product is successfully deleted",
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      "user",
      "avatar name"
    );

    if (!product) {
      const error = new Error("Product was not found");
      return next(error);
    }

    return res.json(product);
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const filter = req.query.searchKeyword;
    let where = {};
    if (filter) {
      where.title = { $regex: filter, $options: "i" };
    }
    let query = Product.find(where);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;
    const total = await Product.find(where).countDocuments();
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
      .populate("user", "avatar name")
      .sort({ updatedAt: "desc" });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getAllProducts,
};

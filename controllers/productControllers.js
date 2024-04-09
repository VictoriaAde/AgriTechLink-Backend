import { uploadPicture } from "../middleware/uploadPictureMiddleware";
import Product from "../models/Product";
import Comment from "../models/Comment";
import { fileRemover } from "../utils/fileRemover";
import { v4 as uuidv4 } from "uuid";

const createProduct = async (req, res, next) => {
  try {
    const product = new Product({
      title: "sample title",
      caption: "sample caption",
      slug: uuidv4(),
      body: {
        type: "doc",
        content: [],
      },
      photo: "",
      user: req.user._id,
    });

    const createdProduct = await product.save();
    return res.json(createdProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      const error = new Error("Product aws not found");
      next(error);
      return;
    }

    const upload = uploadPicture.single("productPicture");

    const handleUpdateProductData = async (data) => {
      const { title, caption, slug, body, tags, categories } = JSON.parse(data);
      product.title = title || product.title;
      product.caption = caption || product.caption;
      product.slug = slug || product.slug;
      product.body = body || product.body;
      product.tags = tags || product.tags;
      product.categories = categories || product.categories;
      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    };

    upload(req, res, async function (err) {
      if (err) {
        const error = new Error(
          "An unknown error occured when uploading " + err.message
        );
        next(error);
      } else {
        // every thing went well
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

    fileRemover(product.photo);

    await Comment.deleteMany({ product: product._id });

    return res.json({
      message: "Product is successfully deleted",
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate([
      {
        path: "user",
        select: ["avatar", "name"],
      },
      {
        path: "categories",
        select: ["title"],
      },
      {
        path: "comments",
        match: {
          check: true,
          parent: null,
        },
        populate: [
          {
            path: "user",
            select: ["avatar", "name"],
          },
          {
            path: "replies",
            match: {
              check: true,
            },
            populate: [
              {
                path: "user",
                select: ["avatar", "name"],
              },
            ],
          },
        ],
      },
    ]);

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
      .populate([
        {
          path: "user",
          select: ["avatar", "name", "verified"],
        },
        {
          path: "categories",
          select: ["title"],
        },
      ])
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

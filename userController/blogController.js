const Blog = require("../model/blogModel");
const User = require("../model/userModel");
const Comment = require("../model/commentModel");
const Like = require("../model/likeModel");
const Favorite = require("../model/favoriteModel");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const { Op } = require("sequelize");
const { successResponse, errorResponse } = require("../utils/response");
const path = require("path");

exports.createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    let image;
    if (req.file) {
      image = req.file.filename;
    }
    const user_id = req.userId;
    console.log("user_id--------j", user_id);

    const blog_id = req.body.blog_id || uuidv4();

    // Create a base slug from the title
    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;

    // Check if the slug already exists and modify it if necessary
    let slugCount = 1;
    while (await Blog.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${slugCount}`; // Append a number to the slug
      slugCount++;
    }

    // Create a new blog post
    const newBlog = await Blog.create({
      blog_id,
      user_id,
      slug,
      title,
      content,
      image,
    });

    successResponse(res, "blog created successfully", 200, newBlog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Error occurred", error: true });
  }
};

exports.viewBlogById = async (req, res) => {
  try {
    const { blog_id } = req.params;

    // Validate the blog_id
    if (!blog_id) {
      return res.status(400).json({ message: "Blog ID is required" });
    }

    // Fetch the blog by ID
    const blog = await Blog.findOne({
      where: {
        [Op.or]: [
          { blog_id },
          { slug: blog_id }, // assuming slug is a variable containing the slug value
        ],
      },
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
    });

    console.log("blog-----------", blog);
    // Check if the blog was found
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Construct the image URL if it exists
    if (blog.dataValues.image) {
      const baseUrl = process.env.BASE_URL || "http://192.168.8.237:5000";
      // blog.dataValues.image = `${baseUrl}/blog-writing/blog_node/uploads/${blog.dataValues.image}`;
      blog.dataValues.image = `${baseUrl}/${blog.dataValues.image}`;
    }
    // Respond with the found blog
    res.status(200).json({
      blog_id: blog.dataValues.blog_id,
      title: blog.dataValues.title,
      content: blog.dataValues.content,
      image: blog.dataValues.image,
      user: blog.User,
    });
  } catch (error) {
    console.error("Error retrieving blog:", error);
    res.status(500).json({ message: "Error occurred", error: true });
  }
};

exports.updateBlogByuserIDandBlogId = async (req, res) => {
  try {
    const { blog_id, title, content } = req.body;
    let image;
    if (req.file) {
      image = req.file.filename;
    }
    user_id = req.userId;
    // Check if user_id and blog_id are provided
    if (!user_id || !blog_id) {
      return res
        .status(400)
        .json({ message: "user_id and blog_id are required", error: true });
    }

    console.log("blog_id-----------------", blog_id);

    // Find the blog post by blog_id and user_id
    const blog = await Blog.findOne({ where: { blog_id: blog_id, user_id } });

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found for the given user", error: true });
    }

    // Generate slug from title
    let slug = slugify(title || blog.title, { lower: true });

    // Check if the generated slug already exists
    let existingSlug = await Blog.findOne({
      where: { slug, blog_id: { [Op.ne]: blog_id } },
    });
    let uniqueSlug = slug;
    let counter = 1;

    // Append a number to slug if it already exists
    while (existingSlug) {
      uniqueSlug = `${slug}-${counter}`;
      existingSlug = await Blog.findOne({
        where: { slug: uniqueSlug, blog_id: { [Op.ne]: blog_id } },
      });
      counter++;
    }

    // Update blog details
    await blog.update({
      title: title || blog.title,
      slug: uniqueSlug,
      content: content || blog.content,
      image: image || blog.image,
    });

    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred", error: true });
  }
};

exports.deleteBlogByID = async (req, res) => {
  try {
    const { blog_id } = req.params;

    // Check if blog_id is provided
    if (!blog_id) {
      return res
        .status(400)
        .json({ message: "blog_id is required", error: true });
    }

    // Find the blog post by blog_id
    const blog = await Blog.findByPk(blog_id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found", error: true });
    }

    // Delete the blog
    await blog.destroy();

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred", error: true });
  }
};

exports.totalBlogs = async (req, res) => {
  try {
    console.log(
      "************************TOTAL BLOGS***************************"
    );
    // Get the page and limit from query parameters, with default values if not provided
    const page = parseInt(req.query.page, 10) || 1; // default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // default to 10 items per page
    const offset = (page - 1) * limit;
    console.log("limit-->", limit, "offset---->", offset);

    const { count, rows: blogs } = await Blog.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit, // Limit the number of results
      offset, // Skip the number of records
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    console.log("blogs--->>", blogs);

    res.status(200).json({
      totalItems: count,
      totalPages,
      currentPage: page,
      blogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred", error: true });
  }
};

exports.viewBlogs = async (req, res) => {
  try {
    const user_id = req.userId;
    console.log({ user_id });
    // Fetch blogs for the specific user
    const blogs = await Blog.findAll({
      where: { user_id: user_id },
      order: [["createdAt", "DESC"]], // Order by creation date in descending order
    });

    res.status(200).json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred", error: true });
  }
};

exports.viewBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Validate the blog_id
    if (!slug) {
      return res.status(400).json({ message: "Blog ID is required" });
    }

    // Fetch the blog by Slug
    const blog = await Blog.findOne({
      where: { slug },
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
    });

    // Check if the blog was found
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Construct the image URL if it exists
    if (blog.dataValues.image) {
      const baseUrl = process.env.BASE_URL || "http://192.168.8.237:5000";
      // blog.dataValues.image = `${baseUrl}/blog-writing/blog_node/uploads/${blog.dataValues.image}`;
      blog.dataValues.image = `${baseUrl}/${blog.dataValues.image}`;
    }
    // Respond with the found blog
    res.status(200).json({
      blog_id: blog.dataValues.blog_id,
      title: blog.dataValues.title,
      content: blog.dataValues.content,
      image: blog.dataValues.image,
      user: blog.User,
    });
  } catch (error) {
    console.error("Error retrieving blog:", error);
    res.status(500).json({ message: "Error occurred", error: true });
  }
};
exports.comment = async (req, res) => {
  try {
    const { comment, blog_id } = req.body;
    const user_id = req.userId; // Assuming req.userId contains the authenticated user's ID

    // Check if the blog exists
    const blog = await Blog.findOne({ where: { blog_id: blog_id } }); // Assuming the blog ID is 'id'
    if (!blog) {
      return errorResponse(res, "Blog not found", 404);
    }

    // Check if the user exists
    const user = await User.findOne({ where: { id: user_id } }); // Assuming the user ID is 'id'
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Get the user's name
    const username = user.name;

    // Create a new comment
    const newComment = await Comment.create({
      user_id,
      blog_id,
      username, // Store the username for the comment
      comment, // Store the actual comment content
    });

    // Send a success response with the new comment data
    return successResponse(res, "Comment added successfully", 201, newComment);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to add comment", 500);
  }
};

exports.allComments = async (req, res) => {
  try {
    const user_id = req.userId;
  } catch (error) {
    return errorResponse(res, "failed to  get Comments", 500);
  }
};

exports.addLike = async (req, res) => {
  try {
    const { blog_id } = req.body;
    const user_id = req.userId;

    // Check if a Like already exists for this blog_id and user_id
    const existingLike = await Like.findOne({
      where: { blog_id: blog_id, user_id: user_id },
    });

    if (existingLike) {
      // If the Like exists, delete it (toggle off)
      await existingLike.destroy();
      const count = await Like.count({ where: { blog_id } });

      return res.status(200).json({
        message: "Like removed successfully",
        currentLikeCount: count,
      });
    } else {
      // If the Like does not exist, create it (toggle on)
      await Like.create({ blog_id: blog_id, user_id: user_id });
      const count = await Like.count({ where: { blog_id } });
      console.log("count-----", count);
      return res
        .status(200)
        .json({ message: "Like added successfully", currentLikeCount: count });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to toggle like" });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { blog_id } = req.body;
    const user_id = req.userId;

    // Check if a favorite already exists for this blog_id and user_id
    const existingLike = await Favorite.findOne({
      where: { blog_id: blog_id, user_id: user_id },
    });

    if (existingLike) {
      // If the favorite exists, delete it (toggle off)
      await existingLike.destroy();
      return res.status(200).json({ message: "favorite removed successfully" });
    } else {
      // If the favorite does not exist, create it (toggle on)
      await Favorite.create({ blog_id: blog_id, user_id: user_id });
      return res.status(200).json({ message: "favorite added successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to toggle favorite" });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { comment, blog_id, parent_id } = req.body;
    const user_id = req.userId; // Assuming req.userId contains the authenticated user's ID
    // Check if the user exists
    const user = await User.findOne({ where: { id: user_id } }); // Assuming the user ID is 'id'
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Get the user's name
    const username = user.name;

    const newComment = await Comment.create({
      comment_id: uuidv4(),
      user_id,
      username,
      comment,
      blog_id,
      parent_id,
    });

    return res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({
      code: 1,
      error: true,
      message: "Failed to add reply",
    });
  }
};

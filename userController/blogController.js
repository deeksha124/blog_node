const Blog = require('../model/blogModel'); 
const User   = require("../model/userModel")
const { v4: uuidv4 } = require("uuid"); 
const slugify = require('slugify'); 
const { Op } = require('sequelize');
const { successResponse } = require('../utils/response');

exports.createBlog = async (req, res) => {
    try {
        const {  title, content, image } = req.body;
        // const user_id = req.userId
        const user_id = 1
        console.log("user_id====", user_id)

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


        successResponse(res ,"blog created successfully" , 200 ,newBlog )
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ message: "Error occurred", error: true });
    }
};

exports.viewBlogById = async (req, res) => {
    try {
        const { blog_id } = req.params;
        console.log("---" , req.params)

        // Fetch the blog by ID
        const blog = await Blog.findOne({
            where: { blog_id:  blog_id }, 
            include: {
                model: User, // Include the User model if you want to get user details
                attributes: ['id', 'name', 'email'], // Adjust attributes as needed
            },
        });

        // Check if the blog was found
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Respond with the found blog
        res.status(200).json(blog);
    } catch (error) {
        console.error("Error retrieving blog:", error);
        res.status(500).json({ message: "Error occurred", error: true });
    }
};

exports.updateBlogByuserIDandBlogId = async (req, res) => {
    try {
        const { user_id, blog_id, title, content, image } = req.body;

        // Check if user_id and blog_id are provided
        if (!user_id || !blog_id) {
            return res.status(400).json({ message: "user_id and blog_id are required", error: true });
        }

        // Find the blog post by blog_id and user_id
        const blog = await Blog.findOne({ where: { blog_id: blog_id, user_id } });
        
        if (!blog) {
            return res.status(404).json({ message: "Blog not found for the given user", error: true });
        }

        // Generate slug from title
        let slug = slugify(title || blog.title, { lower: true });

        // Check if the generated slug already exists
        let existingSlug = await Blog.findOne({ where: { slug, blog_id: { [Op.ne]: blog_id } } });
        let uniqueSlug = slug;
        let counter = 1;

        // Append a number to slug if it already exists
        while (existingSlug) {
            uniqueSlug = `${slug}-${counter}`;
            existingSlug = await Blog.findOne({ where: { slug: uniqueSlug, blog_id: { [Op.ne]: blog_id } } });
            counter++;
        }

        // Update blog details
        await blog.update({
            title: title || blog.title,
            slug: uniqueSlug,
            content: content || blog.content,
            image: image || blog.image
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
            return res.status(400).json({ message: "blog_id is required", error: true });
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

exports.viewBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll();
        console.log("blogs" , blogs)
        res.status(200).json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", error: true });
    }
};
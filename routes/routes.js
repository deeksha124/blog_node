var express = require("express");
require("express-group-routes");
const router = express.Router();
const userController = require("../userController/userController");
const blogController = require("../userController/blogController");
const authenticationMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.group("/user", (userRouter) => {
  userRouter.post("/signup", userController.createUser);
  userRouter.post("/login", userController.loginUser);
  userRouter.get("/homepage", userController.homePage);
  userRouter.get(
    "/dashboard",
    authenticationMiddleware,
    userController.dashboard
  );
  userRouter.get(
    "/adminDashboard",
    authenticationMiddleware,
    userController.adminDashboard
  );
});

router.group("/blog", (blogRouter) => {
  // Authenticate routes
  // blogRouter.use(authenticationMiddleware);

  blogRouter.post(
    "/addblog",
    authenticationMiddleware,
    upload.single("image"),
    blogController.createBlog
  );
  blogRouter.get("/viewblog/:blog_id", blogController.viewBlogById);
  blogRouter.get("/viewblogslug/:slug", blogController.viewBlogBySlug);
  blogRouter.put(
    "/edit",
    authenticationMiddleware,
    upload.single("image"),
    blogController.updateBlogByuserIDandBlogId
  );
  blogRouter.delete("/delete/:blog_id", blogController.deleteBlogByID);
  blogRouter.get(
    "/viewblogslist",
    authenticationMiddleware,
    blogController.viewBlogs
  );
  blogRouter.post("/comment", authenticationMiddleware, blogController.comment);
  blogRouter.get(
    "/allcomments",
    authenticationMiddleware,
    blogController.allComments
  );
  // blogRouter.get("/getlike", blogController.getLike);
  blogRouter.post("/addlike", authenticationMiddleware, blogController.addLike);
  blogRouter.post(
    "/addfavorite",
    authenticationMiddleware,
    blogController.addFavorite
  );

  blogRouter.post(
    "/addReply",
    authenticationMiddleware,
    blogController.addReply
  );
});

module.exports = router;

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  afterUploadImage,
  uploadPost,
  getPost,
} = require("../controllers/post");
const { isLoggedIn } = require("../middlewares");

const router = express.Router();

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error(error, "uploads 폴더가 없으므로 uploads 폴더 생성");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, res, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 경로 : /post/img
router.post("/img", isLoggedIn, upload.single("img"), afterUploadImage);

// 경로 : /post
const upload2 = multer();
router.post("/", isLoggedIn, upload2.none(), uploadPost);

router.get("/", isLoggedIn, getPost);

module.exports = router;

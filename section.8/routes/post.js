const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  afterUploadImage,
  uploadPost,
  getPost,
  getHashtagPost,
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
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

//connect.sid 세션 쿠기가 브라우저에 저장이 안되는 이슈
// 경로 : /post/img
router.post("/img", upload.single("img"), afterUploadImage);

// 경로 : /post
const upload2 = multer();
router.post("/", upload2.none(), uploadPost);

router.get("/", getPost);

router.get("/hashtag", getHashtagPost);

module.exports = router;

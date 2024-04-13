const express = require("express");

const {
  verifyToken,
  apiLimiter,
  corsWhenDomainMatches,
} = require("../middlewares");
const {
  createToken,
  tokenTest,
  getMyPosts,
  getPostsByHashtag,
} = require("../controllers/v2");

const router = express.Router();

router.use(corsWhenDomainMatches);

router.post("/token", apiLimiter, createToken);

// verifyToken 미들웨어를 앞에 두어 토큰이 있는지 없는지를 확인하고 apiLimiter가 실행되도록
router.get("/test", verifyToken, apiLimiter, tokenTest);

router.get("/posts/my", verifyToken, apiLimiter, getMyPosts);

router.get("/posts/hashtag/:title", verifyToken, apiLimiter, getPostsByHashtag);

module.exports = router;

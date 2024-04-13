// 미들웨어는 다른 라우터에서 공통적으로 잘 쓰이는 것들을 주로 구현한다.
const { Domain } = require("../models");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

// 로그인 유무를 파악하는 미들웨어 생성
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent("이미 로그인 된 상태입니다.");
    res.redirect(`/?error=${message}`);
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    res.locals.decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET // 절대 유출 X
    );
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(419).json({
        code: 419,
        message: "토큰이 ㅌ만료되었습니다.",
      });
    }
    return res.status(401).json({
      code: 401,
      message: "유효하지 않은 토큰입니다.",
    });
  }
};

exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 1,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode, // 기본 코드 429
      message: "1분에 한 번만 요청할 수 있습니다.",
    });
  },
});

exports.deprecated = (req, res) => {
  res.status(410).json({
    code: 410,
    message: "새로운 버전이 나왔습니다. 새로운 버전을 사용하세요.",
  });
};

exports.corsWhenDomainMatches = async (req, res, next) => {
  const domain = await Domain.findOne({
    // origin header를 가져와서 URL을 분석하고 host를 추출
    where: { host: new URL(req.get("origin")).host },
  });
  if (domain) {
    cors({
      origin: req.get("origin"), // HTTP 가 붙어있음
      credentials: true,
    })(req, res, next);
  } else {
    next();
  }
};

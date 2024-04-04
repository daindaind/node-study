// 로그인 유무를 파악하는 미들웨어 생성

exports.isLoggedIn = (req, res, mext) => {
  // isAuthenticated로 로그인 유무 파악
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
    res.json(message); // 에러메시지 반환
  }
};

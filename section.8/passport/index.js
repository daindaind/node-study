const passport = require("passport");
const local = require("./localStrategy");
// const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
  passport.serializeUser((user, done) => {
    // 세션 { 348734034789: 1 }     { 세션 쿠키 : 유저 아이디 } -> 메모리에 저징됨
    // user id 만 추출해서 저장 (전체 정보 저장 x)
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({ where: id })
      .then((user) => done(null, user))
      .catch((error) => done(error));
  });

  local();
  //   kakao();
};

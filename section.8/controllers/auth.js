const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      res.status(403).json("이미 존재하는 사용자입니다.");
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.status(200).json("로그인에 성공하였습니다.");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.login = (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      res.status(403).json("로그인 정보가 없습니다.");
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      res.status(200).json("로그인 성공");
    });
  })(req, res, next); // 미들웨어 내 미들웨어에는 (req, res, next)를 붙여야 함.
};

exports.logout = (req, res, next) => {
  req.logout(() => {
    res.status(200).json("로그아웃 성공");
  });
};

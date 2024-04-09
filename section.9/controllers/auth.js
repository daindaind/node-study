const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      res.status(403).json(exUser);
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    const response = await User.create({
      email,
      nick,
      password: hash,
    });
    return res.status(200).json({
      id: response.id,
      email: response.email,
      nickname: response.nick,
    });
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
      res.status(403).json(info.message);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      // 로그인 성공
      res
        .status(200)
        .json({ id: user.id, email: user.email, nickname: user.nick });
    });
  })(req, res, next); // 미들웨어 내 미들웨어에는 (req, res, next)를 붙여야 함.
};

exports.logout = (req, res, next) => {
  req.logout(() => {
    res.status(200).json("로그아웃 성공");
  });
};

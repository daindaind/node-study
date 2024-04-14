const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const nunjucks = require("nunjucks");
const session = require("express-session");
const dotenv = require("dotenv");
const passport = require("passport");

dotenv.config();
const { sequelize } = require("./models");
const passportConfig = require("./passport");

const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");
const v1 = require("./routes/v1");
const v2 = require("./routes/v2");

const app = express();
passportConfig(); // 패스포트 설정
app.set("port", process.env.PORT || 8002);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공!");
  })
  .catch((error) => {
    console.error(error);
  });

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public"))); // public 폴더만 접근 허용 (public 폴더를 static화)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
// 반드시 패스포트 밑에 설정
app.use(passport.initialize()); // req.user, req.login, req.isAuthenticate, req.logout 생성
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/", indexRouter);
app.use("/v1", v1);
app.use("/v2", v2);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없음`);
  error.status = 404;
  next(error);
});
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

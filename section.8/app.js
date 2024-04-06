const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors"); // cors 해결하기

const session = require("express-session");
const dotenv = require("dotenv");
const passport = require("passport");
const { sequelize } = require("./models");
const passportConfig = require("./passport");

const authRouter = require("./routes/auth");

dotenv.config();

const app = express();
passportConfig(); // 패스포트 설정
app.set("port", process.env.PORT || 8001);
app.use(cors());

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공!");
  })
  .catch((error) => {
    console.error(error);
  });

app.use(morgan("dev"));
// app.use(express.static(path.join(__dirname, "public"))); // public 폴더만 접근 허용 (public 폴더를 static화)
app.use("/img", express.static(path.join(__dirname, "uploads")));
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

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없음`);
  error.status = 404;
  next(error);
});
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중!");
});

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");

const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");

// 1. app, app 관련 설정 -----------------------
const app = express();

app.set("port", process.env.PORT || 3000);
// ---------------------------------------------

// 2. 미들웨어 -------------------------------
app.use(morgan("dev")); // 요청과 응답을 기록
// app.use("/", express.static(path.join(__dirname, "public"))); // app.use("요청 경로", express.static("실제 경로"));
app.use(cookieParser(process.env.COOKIE_SECRET)); // 서명된 쿠키
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true, // js 로 공격당하지 않는다.
    },
    name: "connect.sid",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router 객체로 라우팅 분리
app.use("/", indexRouter);
app.use("/user", userRouter);

// 이 함수 자체가 미들웨어 역할을 한다.
app.use(
  (req, res, next) => {
    console.log("모든 요청에 실행");
    next();
  },
  (req, res, next) => {
    try {
      //   throw new Error("에러임");  // 에러가 발생했다고 생각했을 때
    } catch (error) {
      next(error); // 에러를 catch해서 밑에 에러를 처리하는 코드로 보냄
    }
  }

  //   (req, res, next) => {
  //     throw new Error("에러가 났어요 ㅜㅁㅜ");
  //   }
);
// ---------------------------------------------

// multer 사용 ---------------------------------
try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads/");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "multipart.html"));
});
app.post("/upload", upload.single("image"), (req, res) => {
  console.log(req.file);
  res.send("ok");
});
// -------------------------------------------

// 3. 라우팅 ---------------------------------
// app.get("/", (req, res) => {
//   //   res.end("hello express");
//   //   res.setHeader('Content-Type', 'test/html');
//   req.cookies;
//   req.signedCookies;
//   res.cookie("name", encodeURIComponent(name), {
//     expires: new Date(),
//     httpOnly: true,
//     path: "/",
//   });
//   res.clearCookie("name", encodeURIComponent(name), {
//     httpOnly: true,
//     path: "/",
//   });
//   res.sendFile(path.join(__dirname, "index.html")); // 현재 경로에서 해당 파일 경로 가져오기
//   //   res.send("hello");
//   //   res.json({ hello: "dain" });  // return이 없으므로 함수 종료가 안 된다.
//   //   console.log('hello dain');    // 따라서 해당 코드는 출력된다.
// });

// // 라우팅 파라미터
// app.get("/category/:name", (req, res) => {
//   const name = req.params.name;
//   res.send(`hello ${name}`);
// });

// // if 문으로 굳이 구분하지 않아도 됨
// app.get("/about", (req, res) => {
//   res.end("hello about");
// });

// 라우터 코드, 에러 미들웨어 사이에 위치
// 404 에러 처리
// 모든 라우터 코드를 거쳐도 발견하지 못했기 때문 -> 404
app.use((req, res, next) => {
  // 실제 에러가 발생한 것은 아니지만, 404에러처럼 처리
  res.status(200).send("404 에러입니다!");
});
// ----------------------------------------------

// 4. 에러 미들웨어 -----------------------------
// 에러 미들웨어를 작성할 때 next까지 꼭 붙여줘야 한다!!
// 에러 미들웨어는 매개변수를 4개 작성하기.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(200).send("에러가 발생했습니다. 다시 시도해주세요 !");
});
// ----------------------------------------------

app.listen(app.get("port"), () => {
  console.log("익스프레스 서버 실행 !!");
});

const express = require("express");
const { sequelize } = require("./models");
const morgan = require("morgan");
const path = require("path");

const app = express();
app.set("port", process.env.PORT || 3002); // 포트 설정 : PORT 가 지정되어있지 않으면 3003변 포트 사용

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결!");
  })
  .catch((errer) => {
    console.error("데이터베이스 연결 실패 ㅜㅡㅜ");
  });

app.use(morgan("dev"));
// app.use(express.static(path.join(__dirname , 'public')));
app.use(express.json()); // 클라이언트에서 받은 JSON 요청의 body를 parsing한다.
app.use(express.urlencoded({ extended: false })); // 클라이언트에서 받은 인코딩된 요청의 body를 parsing한다.
// 클라이언트 요청 headers의 content-type : x-www-form-urlencoded -> express.urlencoded로 해석
// 클라이언트 요청 headers의 content-type : application/json -> express.json으로 해석

// 404 에러 처리 (잘못된 url 요청)
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.ur} 라우터가 없어요!`);
  error.status = 404;
  next(error); // 에러 핸들러 미들웨어로 연결 (에러 전달)
});

// 에러 핸들러. 4개의 매개변수를 갖는다. (err, req, res, next)
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {}; // 개발 환경일 때만 에러 발생
  res.status(err.status || 500);
  res.render("error");
});

// app.listen([서버를 실행할 포트 번호], [서버 오픈 시 실행될 콜백함수])
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});

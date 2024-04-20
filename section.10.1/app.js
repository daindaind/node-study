const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const session = require("express-session");

const ColorHash = require("color-hash").default;
const cors = require("cors");
const http = require("http");

const webSocket = require("./socket");
const path = require("path");
const connect = require("./schemas");

const app = express();
app.set("port", process.env.PORT || 8005);
connect();
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const indexRouter = require("./routes");

app.use(morgan("dev"));
app.use("/gif", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
});

app.use(sessionMiddleware);
app.use((req, res, next) => {
  console.log("서버에 요청하는 사람의 컬러: ", req.session.color);
  if (!req.session.color) {
    const colorHash = new ColorHash();
    req.session.color = colorHash.hex(req.sessionID);
    console.log(req.session.color, req.sessionID);
  }
  next();
});

app.use("/", indexRouter);

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

const server = http.createServer(app);
server.listen(process.env.PORT, () =>
  console.log(`서버가 ${process.env.PORT} 에서 시작되었어요`)
);

webSocket(server, app, sessionMiddleware);

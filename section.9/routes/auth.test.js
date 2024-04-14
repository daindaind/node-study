const request = require("supertest");
const { sequelize } = require("../models"); // 실제 시퀄라이즈를 사용해서 테스트 함
const app = require("../app");

beforeAll(async () => {
  // 데이터베이스에 테이블 생성
  await sequelize.sync();
});

describe("POST /join", () => {
  test("로그인 안 했으면 가입", (done) => {
    request(app)
      .post("/auth/join")
      .send({
        email: "1904vv@gmail.com",
        nick: "ekdls",
        password: "kejfosf",
      })
      .expect("Location", "/")
      .expect(302, done);
  });
});

describe("POST /join", () => {
  // 같은 agent를 사용함
  const agent = request.agent(app);
  // 해당 테스트를 실행하기 전에 로그인을 먼저 시도함.
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "1904vv@gmail.com",
        password: "kejfosf",
      })
      .end(done);
  });

  test("이미 로그인 했으면 redirect /", (done) => {
    const message = encodeURIComponent("이미 로그인 된 상태입니다.");
    agent
      .post("/auth/join")
      .send({
        email: "1904vv@gmail.com",
        nick: "ekdls",
        password: "kejfosf",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });
});

describe("POST /login", () => {
  test("가입되지 않은 회원", (done) => {
    const message = encodeURIComponent("가입되지 않은 사용자입니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "1904vv@naver.com",
        password: "kejfosf",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });

  test("로그인 수행", (done) => {
    request(app)
      .post("/auth/login")
      .send({
        email: "1904vv@gmail.com",
        password: "kejfosf",
      })
      .expect("Location", "/")
      .expect(302, done);
  });

  test("비밀번호 틀림", (done) => {
    const message = encodeURIComponent("비밀번호가 일치하지 않습니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "1904vv@gmail.com",
        password: "kejfosf",
      })
      .expect("Location", `/`)
      .expect(302, done);
  });
});

describe("GET /logout", () => {
  test("로그인 되어있지 않으면 403", (done) => {
    request(app).get("/auth/logout").expect(403, done);
  });

  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "1904vv@gmail.com",
        password: "kejfosf",
      })
      .end(done);
  });

  test("로그아웃 수행", (done) => {
    agent.get("/auth/logout").expect("Location", "/").expect(302, done);
  });
});

afterAll(async () => {
  await sequelize.sync({ force: true });
});

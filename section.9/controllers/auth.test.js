jest.mock("../models/user");
const User = require("../models/user");
const { join } = require("./auth");

describe("join", () => {
  const req = {
    body: {
      email: "1904vv@naver.com",
      nick: "다인",
      password: "dsdhflsdfh",
    },
  };
  const res = {
    redirect: jest.fn(),
  };
  const next = jest.fn();

  test("사용자를 찾아 이메일을 확인하고 유저가 이미 존재한다면 에러페이지로 redirect 됨", async () => {
    User.findOne.mockReturnValue(Promise.resolve(true));
    await join(req, res, next);
    expect(res.redirect).toBeCalledWith("/join?error=exist");
  });

  test("사용자를 찾아 이메일을 확인하고 유저가 존재하지 않는다면 비밀번호를 확인하고 홈으로 redirect 됨", async () => {
    User.findOne.mockReturnValue(null);
    await join(req, res, next);
    expect(res.redirect).toBeCalledWith("/");
  });

  test("회원가입 과정에러 에러가 발생하면 next(error)를 실행한다.", async () => {
    const message = "DB 에러";
    User.findOne.mockReturnValue(Promise.reject(message));
    await join(req, res, next);
    expect(next).toBeCalledWith(message);
  });
});

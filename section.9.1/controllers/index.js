const axios = require("axios");

// 토큰 테스트 라우터
exports.test = async (req, res, next) => {
  try {
    // 세션에 토큰이 없으면 토큰 발급 시도
    if (!req.session.jwt) {
      const tokenResult = await axios.post("http://localhost:8002/v1/token", {
        clientSecret: process.env.CLIENT_SECRET,
      });

      // 토큰 발급 성공
      if (tokenResult.data?.code === 200) {
        req.session.jwt = tokenResult.data.token; // 세션에 토큰 저장
      } else {
        return res.json(tokenResult.data); // 세션 토큰 발급 실패 시 사유 응답
      }
    }

    // 발급 받은 토큰 테스트
    const result = await axios.get("http://localhost:8002/v1/test", {
      headers: { authorization: req.session.jwt },
    });
    return res.json(result.data);
  } catch (error) {
    console.error(error);
    if (error.response?.status === 419) {
      // 토큰 만료됨
      return res.json(error.response.data);
    } else if (error.response?.status === 401) {
      // 유효하지 않은 토큰
      return res.json(error.response.data);
    }
    return next(error);
  }
};

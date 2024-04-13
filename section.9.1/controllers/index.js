const axios = require("axios");

const URL = process.env.API_URL;
axios.defaults.headers.origin = process.env.ORIGIN_URL;

// 토큰 테스트 라우터
exports.test = async (req, res, next) => {
  try {
    // 세션에 토큰이 없으면 토큰 발급 시도
    if (!req.session.jwt) {
      const tokenResult = await axios.post("http://localhost:8002/v1/token", {
        clientSecret: process.env.CLIENT_SECRET,
      });

      console.log(tokenResult);

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

// 토큰이 있는지 확인하고 없으면 새로 발급받아 api 요청을 시도하는 부분
// 라우터 요청마다 반복되므로 따로 함수로 분리
const request = async (req, api) => {
  console.log(req.session.jwt);
  try {
    // 세션에 토큰이 없으면 다시 발급 받기
    if (!req.session.jwt) {
      const tokenResult = await axios.post(`${URL}/token`, {
        clientSecret: process.env.CLIENT_SECRET,
      });
      // 세션에 토큰 저장
      req.session.jwt = tokenResult.data.token;
    }

    // 발급 받은 토큰 보내보기
    return await axios.get(`${URL}${api}`, {
      headers: { authorization: req.session.jwt },
    });
  } catch (error) {
    // 토큰 만료되면 다시 토큰 재발급 받기 (재귀함수 호출)
    if (error.response?.status === 419) {
      delete req.session.jwt; // 세션에서 토큰 삭제
      return request(req, api);
    }
    return error.response; // 에러를 return 해도 되고, throw 해도 됨.
  }
};

exports.getMyPosts = async (req, res, next) => {
  try {
    const result = await request(req, "/posts/my");
    console.log(result);
    res.json(result.data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.searchByHashtag = async (req, res, next) => {
  try {
    const result = await request(
      req,
      `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`
    );
    res.json(result.data);
  } catch (error) {
    if (error.code) {
      console.error(error);
      next(error);
    }
  }
};

exports.renderMain = (req, res) => {
  res.render("main", { key: process.env.CLIENT_SECRET });
};

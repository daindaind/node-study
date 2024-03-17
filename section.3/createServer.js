const http = require("http");
const fs = require("fs").promises;

const server = http
  .createServer(async (req, res) => {
    try {
      res.writeHead(200, { "Content-type": "text/html; charset=utf-8" });
      // html을 여기에 적는 것은 비효율적
      // res.write("<h1>Hello World</h1>");
      // res.write("<p>Hello server</p>");
      // res.end("<p>Hello Dain</p>");

      // 이렇게 html 파일을 읽어 표시하는 것이 더 편함.
      const data = await fs.readFile("./server2.html");
      res.end(data);
    } catch (e) {
      console.error(e);
      res.writeHead(200, { "Content-type": "text/plain; charset=utf-8" });
      res.end(e.message);
    }
  })
  .listen(8080);
//하나의 주소 밑에 여러 개의 프로그램을 띄워 놓는다.

server.on("listening", () => {
  console.log("8080번 포트에서 서버 대기 중..");
});

server.on("error", (error) => {
  console.log(error);
});

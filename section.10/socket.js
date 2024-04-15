const SocketIO = require("socket.io");

module.exports = (server, app) => {
  const io = SocketIO(server, { path: "/socket.io" });

  app.set("io", io);
  const room = io.of("/room");
  const chat = io.of("/chat");

  room.on("connection", (socket) => {
    console.log("room 네임스페이스에 접속");
    socket.on("disconnect", () => {
      console.log("room 네임스페이스 접속 해제");
    });
  });

  chat.on("connection", (socket) => {
    console.log("chat 네임스페이스에 접속");

    socket.on("join", (data) => {
      socket.join(data);
    });

    socket.on("disconnect", () => {
      console.log("chat 네임스페이스 접속 해제");
    });
  });

  // io.on("connection", (socket) => {
  //   const req = socket.request;
  //   const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  //   console.log("새로운 클라이언트 접속", ip, socket.id, req.ip);
  //   socket.on("disconnect", (message) => {
  //     console.log("클라이언트 접속 해제", ip, socket.id);
  //     clearInterval(socket.interval);
  //   });
  //   socket.on("error", (error) => {
  //     console.error(error);
  //   });
  //   socket.on("reply", (data) => {
  //     console.log(data);
  //   });

  //   socket.interval = setInterval(() => {
  //     socket.emit("news", "Hello socket.io");
  //   }, 3000);
  // });
};

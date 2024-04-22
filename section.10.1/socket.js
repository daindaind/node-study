const SocketIO = require("socket.io");
const { removeRoom, renderChats } = require("./services");

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  app.set("io", io);
  const room = io.of("/room");
  const chat = io.of("/chat");

  const wrap = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);
  chat.use(wrap(sessionMiddleware));

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
      const currentRoom = chat.adapter.rooms.get(data);
      const userCount = currentRoom?.size || 0;
      console.log("현재 방 인원 수: ", userCount);
      chat.emit("joinUser", {
        user: socket.request.session.color,
        chat: `${socket.request.session.color}님이 입장하셨습니다.`,
      });
      socket.to(data).emit("join", {
        user: "system",
        chat: `${socket.request.session.color}님이 입장하셨습니다.`,
      });
    });

    socket.on("chats", async (data) => {
      const chats = await renderChats(data);
      chat.emit("renderChats", chats);
      socket.to(data).emit("chats", {
        chat: chats,
      });
    });

    socket.on("leave-room", async (data) => {
      const currentRoom = chat.adapter.rooms.get(data);
      const userCount = currentRoom?.size || 0;
      console.log("현재 방 인원 수: ", userCount);
      if (userCount === 1) {
        await removeRoom(data);
        room.emit("removeRoom", data);
        console.log("방 제거 요청 성공");
      } else {
        chat.emit("exitUser", {
          user: socket.request.session.color,
          chat: `${socket.request.session.color}님이 퇴장하셨습니다.`,
        });

        socket.to(data).emit("exit", {
          user: "system",
          chat: `${socket.request.session.color}님이 퇴장하셨습니다.`,
        });
      }
    });

    // socket.on("disconnect", async (data) => {
    //   console.log("chat 네임스페이스 접속 해제");
    //   const { referer } = socket.request.headers;
    //   const roomId = new URL(referer).pathname.split("/").at(-1);
    //   const currentRoom = chat.adapter.rooms.get(roomId);
    //   const userCount = currentRoom?.size || 0;
    //   if (userCount === 0) {
    //     await removeRoom(roomId);
    //     room.emit("removeRoom", roomId);
    //     console.log("방 제거 요청 성공");
    //   } else {
    //     chat.emit("exitUser", {
    //       user: "system",
    //       chat: `${socket.request.session.color}님이 퇴장하셨습니다.`,
    //     });
    //     socket.to(roomId).emit("exit", {
    //       user: "system",
    //       chat: `${socket.request.session.color}님이 퇴장하셨습니다.`,
    //     });
    //   }
    // });
  });
};

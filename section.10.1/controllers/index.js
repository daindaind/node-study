const Room = require("../schemas/room");
const Chat = require("../schemas/chat");
const { removeRoom: removeRoomService, renderChats } = require("../services");

exports.renderRoom = async (req, res, next) => {
  try {
    const rooms = await Room.find({});
    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const newRoom = await Room.create({
      title: req.body.title,
      max: req.body.max,
      owner: req.session.color,
      password: req.body.password,
    });
    const io = req.app.get("io");
    io.of("/room").emit("new Room", newRoom);
    if (req.body.password) {
      res.status(201).json({
        roomId: newRoom._id,
        password: req.body.password,
      });
    } else {
      res.status(201).json({
        roomId: newRoom._id,
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.enterRoom = async (req, res, next) => {
  console.log("유저 세션 컬러 : ", req.session.color);
  try {
    const room = await Room.findOne({ _id: req.params.id });
    // console.log(room);
    if (!room) {
      return res
        .status(403)
        .json({ code: 403, message: "존재하지 않는 방입니다." });
    }
    if (room.password && room.password !== req.params.password) {
      return res
        .status(403)
        .json({ code: 403, message: "비밀번호가 틀렸습니다." });
    }
    const io = req.app.get("io");
    const { rooms } = io.of("/chat").adapter;
    if (rooms.max <= rooms.get(req.params.id)?.size) {
      return res
        .status(403)
        .json({ code: 403, message: "허용 인원을 초과하였습니다." });
    }
    const chats = await Chat.find({ room: room._id }).sort("createdAt");
    return res.status(201).json({
      room,
      title: room.title,
      chats,
      user: req.session.color,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.removeRoom = async (req, res, next) => {
  // removeRoom 서비스와 컨트롤러로 분리
  // 재사용성 높아짐
  console.log("요청받은 방 아이디: ", req.params.id);
  try {
    await removeRoomService(req.params.id);
    res.send("ok");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.renderChats = async (req, res, next) => {
  try {
    const chats = await renderChats(req.params.id);
    res.status(200).json({
      chats,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.sendChat = async (req, res, next) => {
  console.log("채팅 보낼때 유저 컬러 : ", req.session.color);
  try {
    const chat = await Chat.create({
      room: req.params.id,
      user: req.session.color,
      chat: req.body.chat,
    });
    req.app.get("io").of("/chat").to(req.params.id).emit("chat", chat);
    // req.app.get("io").of("/chat").broadcast().emit("chat", chat);
    res.status(201).json({ chat });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

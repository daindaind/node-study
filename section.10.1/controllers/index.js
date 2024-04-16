const Room = require("../schemas/room");
const Chat = require("../schemas/chat");
const { removeRoom: removeRoomService } = require("../services");

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

const Room = require("../schemas/room");
const Chat = require("../schemas/chat");

exports.removeRoom = async (roomId) => {
  try {
    await Room.deleteOne({ _id: roomId });
    await Room.deleteMany({ room: roomId });
  } catch (error) {
    // 에러 발생했을 때 넘겨줌 (컨트롤러로)
    throw error;
  }
};

exports.renderChats = async (roomId) => {
  try {
    const room = await Room.findOne({ _id: roomId });
    if (room) {
      const roomChat = await Chat.find({ room: room._id }).sort("createdAt");
      return roomChat;
    }
  } catch (error) {
    throw error;
  }
};

const Sequelize = require("sequelize");
const User = require("./user");
const Comment = require("./comment");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
db.Comment = Comment;

// 테이블이 모델로 연결됨
User.initiate(sequelize);
Comment.initiate(sequelize);

// 테이블간의 관계 설정을 위한 메서드 실행
User.associate(db);
Comment.associate(db);

module.exports = db;

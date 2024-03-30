// 주석 처리된 부분은 npx sequelize init을 실행했을 때 자동으로 생성되는 부분에서
// 필요 없는 부분을 지운 것이다. 이후 다른 프로젝트를 할 때는 주석처리 하지 않고
// 아예 제거하는 것이 좋겠다.

// 'use strict';

// const fs = require('fs');
// const path = require('path');
const Sequelize = require("sequelize");

// 만들어둔, User와 Comment 모델
const User = require("./user");
const Comment = require("./comment");

// const process = require('process');
// const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       file.indexOf('.test.js') === -1
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

db.sequelize = sequelize;
// db.Sequelize = Sequelize;

db.User = User;
db.Comment = Comment;

User.initiate(sequelize);
Comment.initiate(sequelize);

User.associate(db);
Comment.associate(db);

module.exports = db;

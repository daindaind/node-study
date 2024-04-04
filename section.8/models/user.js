const Sequelize = require("sequelize");

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: true,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        provider: {
          type: Sequelize.ENUM("local", "kakao"),
          allowNull: false,
          defaultValue: "local",
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    // Post와 User 간 일대다 관계 생성
    db.User.hasMany(db.Post); // 유저가 여러개의 게시글을 가질 수 있다. 게시글이 유저에 속해있다.

    // 같은 테이블 간 다대다 관계 생성
    db.User.belongsToMany(db.User, {
      // 유저 A의 팔로워를 확인하고 싶다. 그때 어떤 유저의 followingId를 확인해야지, 해당 유저가 유저 A를 팔로우 하고있는지 확인 가능.
      foreignKey: "followingId",
      as: "Followers",
      through: "Follow",
    });
    db.User.belongsToMany(db.User, {
      // 유저 A의 팔로잉을 확인하고 싶다. 그때 어떤 유저의 followerId를 확인해야지, 유저 A가 해당 유저를 팔로우 하고 있는지 확인 가능.
      foreignKey: "followerId",
      as: "Followings",
      through: "Follow",
    });
  }
}

module.exports = User;

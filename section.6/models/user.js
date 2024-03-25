const Sequelize = require("sequelize");

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init(
      {
        // id 없어도 자동으로 넣어줌
        // id: {
        //     type: Sequelize.INTEGER,
        //     primaryKey: true,
        //     autoIncrement: true
        // }
        name: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true,
        },
        age: {
          type: Sequelize.TINYINT.UNSIGNED,
          allowNull: false,
        },
        married: {
          type: Sequelize.BOOLEAN, // 시퀄라이즈에서는 boolean으로 사용 (tinyint X)
          allowNull: false,
        },
        comment: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE, // DATETIME, MYSQL DATE => Sequelize Dateonly
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      // 모델에 대한 설정
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Comment, { foreignKey: "commenter", sourceKey: "id" });
    // 어떤 사용자의 id는 어떤 댓글이 참조 중이다.
  }
}

module.exports = User;

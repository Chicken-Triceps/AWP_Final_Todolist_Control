// models/user.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: { // 로그인에 사용될 이메일
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    password: { // 암호화된 비밀번호
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nickname: { // 사용자 표시 이름
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    provider: { // local, kakao 등 로그인 방식 구분
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'local',
    }
  }, {
    // 모델 옵션 설정
    tableName: 'users',
    timestamps: true, // createdAt, updatedAt column 자동 추가
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  // 관계 설정 (Associate)
  User.associate = (db) => {
    // 1:N 관계: User(1)가 Schedule(N)을 가짐
    db.User.hasMany(db.Schedule, { foreignKey: 'userId', sourceKey: 'id' });
  };

  return User;
};
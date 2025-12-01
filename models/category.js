// models/category.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(7), // 예: #ff0000
      defaultValue: '#333333',
    },
  }, {
    tableName: 'categories',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  Category.associate = (db) => {
    // 사용자가 카테고리를 가짐 (1:N)
    db.Category.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
    // 카테고리는 여러 일정을 가짐 (1:N) -> 나중에 Schedule 모델에도 연결 필요
    // db.Category.hasMany(db.Schedule, ...); 
  };

  return Category;
};
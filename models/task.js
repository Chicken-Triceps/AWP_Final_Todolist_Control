// models/task.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: { // 할일 내용
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isDone: { // 할일 완료 여부
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'tasks',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  // 관계 설정 (Associate)
  Task.associate = (db) => {
    // N:1 관계: Task(N)는 Schedule(1)에 속함 (fk: scheduleId)
    db.Task.belongsTo(db.Schedule, { foreignKey: 'scheduleId', targetKey: 'id' });
  };

  return Task;
};
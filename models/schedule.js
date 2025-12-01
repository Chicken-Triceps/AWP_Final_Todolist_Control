// models/schedule.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Schedule = sequelize.define('Schedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: { // 일정 제목
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: { // 일정 상세 내용
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: { // 시작 날짜 및 시간
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: { // 종료 날짜 및 시간
      type: DataTypes.DATE,
      allowNull: false,
    },
    isAllDay: { // 종일 여부
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isComplete: { // 일정 완료 여부
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'schedules',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  // 관계 설정 (Associate)
  Schedule.associate = (db) => {
    // N:1 관계: Schedule(N)은 User(1)에 속함 (외래키: userId)
    db.Schedule.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });

    // 1:N 관계: Schedule(1)가 Task(N)를 가짐
    db.Schedule.hasMany(db.Task, { foreignKey: 'scheduleId', sourceKey: 'id' });
    
    // 다대다 관계
    db.Schedule.belongsToMany(db.Category, { through: 'ScheduleCategory' });
  };

  return Schedule;
};
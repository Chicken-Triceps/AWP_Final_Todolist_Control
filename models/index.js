// models/index.js

const Sequelize = require('sequelize');
// .env 파일을 포함하는 config.js 로드
const config = require(__dirname + '/../config/config.js');
const db = {};

// 현재 환경 설정 선택 (기본값: development)
const env = process.env.NODE_ENV || 'development';
const databaseConfig = config[env];

// Sequelize 인스턴스 생성 및 연결
const sequelize = new Sequelize(
  databaseConfig.database,
  databaseConfig.username,
  databaseConfig.password,
  databaseConfig
);

// DB 객체에 sequelize 인스턴스를 저장
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 모델 불러오기 ===================================================================

db.User = require('./user')(sequelize, Sequelize);
db.Schedule = require('./schedule')(sequelize, Sequelize);
db.Task = require('./task')(sequelize, Sequelize);
db.Category = require('./category')(sequelize, Sequelize);

// 모델 관계 설정 =======================================================

// User와 Schedule, Schedule와 Task 간의 관계 설정
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


module.exports = db;
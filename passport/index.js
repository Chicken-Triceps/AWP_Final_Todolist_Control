// passport/index.js

const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy'); // 카카오 전략 불러오기
const { User } = require('../models');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({ where: { id } })
      .then(user => done(null, user))
      .catch(err => done(err));
  });

  local();
  kakao(); // 카카오 전략 등록 실행
};
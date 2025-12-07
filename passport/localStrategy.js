// passport/localStrategy.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt'); // 비밀번호 비교를 위한 모듈

const { User } = require('../models'); // User 모델 불러오기

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email', // req.body.email을 인증에 사용
    passwordField: 'password', // req.body.password를 인증에 사용
  }, async (email, password, done) => {
    try {
      // 사용자 이메일로 DB에서 사용자 정보 조회
      const user = await User.findOne({ where: { email } });

      if (user) {
        // 사용자가 존재하면, 비밀번호 비교 (bcrypt 사용)
        // bcrypt.compare(입력된 비밀번호, DB에 저장된 해시된 비밀번호)
        const result = await bcrypt.compare(password, user.password);

        if (result) {
          // 비밀번호 일치: 로그인 성공
          done(null, user); // done(서버 에러, 사용자 객체)
        } else {
          // 비밀번호 불일치
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' }); // done(서버 에러, 성공 여부, 인증 실패 메시지)
        }
      } else {
        // 사용자가 존재하지 않음
        done(null, false, { message: '가입되지 않은 이메일입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error); // done(서버 에러)
    }
  }));
};
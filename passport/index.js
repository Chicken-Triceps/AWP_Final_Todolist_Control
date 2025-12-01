// passport/index.js

const local = require('./localStrategy'); // 로컬 로그인 전략 불러오기
// const kakao = require('./kakaoStrategy'); // 카카오 로그인 전략 (추후 구현 예정)
const { User } = require('../models');

module.exports = (passport) => {
  // 1. 사용자 정보 직렬화 (Serialization) =====================================================
  // 로그인 성공 시 사용자 정보를 세션에 저장
  passport.serializeUser((user, done) => {
    // done(서버 에러, 세션에 저장할 사용자 ID)
    done(null, user.id); 
  });

  // 2. 사용자 정보 역직렬화 (Deserialization) ==================================================
  // 매 요청 시 세션에 저장된 ID를 이용하여 DB에서 사용자 정보 로드
  passport.deserializeUser((id, done) => {
    User.findOne({ 
        where: { id },
        // 추후 필요 시 join할 모델을 여기에 포함
        // include: [{
        //     model: db.Schedule,
        // }]
    })
      .then(user => done(null, user)) // req.user에 사용자 정보를 저장
      .catch(err => done(err));
  });

  // 정의한 전략 등록
  local();
  // kakao(); // 카카오 전략 (추후 등록 예정)
};
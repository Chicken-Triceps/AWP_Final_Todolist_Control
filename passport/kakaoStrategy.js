// passport/kakaoStrategy.js

const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

module.exports = () => {
   passport.use(new KakaoStrategy({
      clientID: process.env.KAKAO_ID,
      clientSecret: process.env.KAKAO_SECRET, //
      callbackURL: '/auth/kakao/callback', // auth 로 변경
   }, async (accessToken, refreshToken, profile, done) => {
      console.log('kakao profile', profile);
      try {
         // 1. 이미 가입된 사용자인지 확인
         const exUser = await User.findOne({
            where: { snsId: profile.id, provider: 'kakao' },
         });

         if (exUser) {
            // 2. 가입된 사용자면 로그인
            done(null, exUser);
         } else {
            // 3. 가입 안 된 사용자면 회원가입
            const newUser = await User.create({
               email: profile._json && profile._json.kakao_account.email,
               nickname: profile.displayName,
               snsId: profile.id,
               provider: 'kakao',
               password: 'kakao-login-dummy-password', // 로컬 로그인용 비번 (임의값)
            });
            done(null, newUser);
         }
      } catch (error) {
         console.error(error);
         done(error);
      }
   }));
};
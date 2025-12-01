// routes/user.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // 비밀번호 해싱을 위한 모듈
const passport = require('passport'); // Passport 모듈

const { User } = require('../models');

// 회원가입 처리 (POST /user/join) =======================================================================
router.post('/join', async (req, res, next) => {
    const { email, nickname, password } = req.body;
    try {
        // 1. 기존 사용자 확인
        const exUser = await User.findOne({ where: { email } });
        if (exUser) {
            // 이미 가입된 이메일인 경우
            return res.redirect('/join?error=exist'); // 에러 메시지와 함께 리다이렉트
        }

        // 2. 비밀번호 암호화 (해싱)
        // 보안을 위해 비밀번호를 평문으로 저장하지 않고 bcrypt로 해시
        const hash = await bcrypt.hash(password, 12); // 솔트 라운드 12

        // 3. 사용자 정보 DB에 생성
        await User.create({
            email,
            nickname,
            password: hash, // 암호화된 비밀번호 저장
            provider: 'local', // 로컬 로그인 방식 명시
        });

        return res.redirect('/login'); // 회원가입 성공 후 로그인 페이지로 이동
    } catch (error) {
        console.error(error);
        next(error); // 에러 처리 미들웨어로 전달
    }
});


// 로그인 처리 (POST /user/login) =========================================================================
// Passport의 로컬 전략을 사용하여 인증을 시도합니다.
router.post('/login', (req, res, next) => {
    // passport.authenticate('local', ...) 미들웨어를 실행합니다.
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError); // 서버 에러 발생 시
        }
        if (!user) {
            // 인증 실패 시 (비밀번호 불일치, 사용자 없음 등)
            return res.redirect(`/login?error=${info.message}`); // 실패 메시지와 함께 리다이렉트
        }
        
        // 로그인 성공 시 (세션에 사용자 정보 저장)
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/'); // 메인 페이지로 이동
        });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙여 실행
});


// ** 로그아웃 처리 (GET /user/logout) **
router.get('/logout', (req, res) => {
    req.logout(() => { // req.session.destroy()를 실행, 세션 삭제
        res.redirect('/'); // 메인 페이지로 이동
    });
});

// 카카오 로그인 요청 ==========================================================
// 이 라우터로 요청이 오면 카카오 로그인 페이지로 이동
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백
// 카카오 인증 후 다시 우리 서버로 돌아오는 경로
router.get('/kakao/callback', passport.authenticate('kakao', {
   failureRedirect: '/login', // 로그인 실패 시 이동할 곳
}), (req, res) => {
   // 로그인 성공 시 이동할 곳
   res.redirect('/'); 
});


module.exports = router;
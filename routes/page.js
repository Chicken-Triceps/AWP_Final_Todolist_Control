// routes/page.js

const express = require('express');
const router = express.Router();

// 미들웨어: 로그인 상태 확인 (인증 미들웨어)
// req.isAuthenticated()는 Passport가 제공, 로그인되어 있으면 true를 반환
const { isLoggedIn, isNotLoggedIn } = require('./middlewares'); 

// 메인 페이지 (GET /)
router.get('/', (req, res) => {
    res.render('index', { 
        title: '일정 관리 서버',
        user: req.user, // 로그인 정보
    });
});

// 회원가입 페이지 (GET /join)
router.get('/join', isNotLoggedIn, (req, res) => {
    // 쿼리스트링에서 joinError를 가져와 템플릿에 전달
    res.render('join', {
        title: '회원가입',
        joinError: req.query.error, // 에러 메시지 (예: exist)
    });
});

// 로그인 페이지 (GET /login)
router.get('/login', isNotLoggedIn, (req, res) => {
    // 쿼리스트링에서 loginError를 가져와 템플릿에 전달
    res.render('login', {
        title: '로그인',
        loginError: req.query.error, // 에러 메시지 (예: 비밀번호가 일치하지 않습니다.)
    });
});

module.exports = router;
// routes/page.js

const express = require('express');
const router = express.Router();

// 미들웨어: 로그인 상태 확인 (인증 미들웨어)
// req.isAuthenticated()는 Passport가 제공, 로그인되어 있으면 true를 반환
const { isLoggedIn, isNotLoggedIn } = require('./middlewares'); 

// 메인 페이지 (달력 표시)
router.get('/', (req, res) => {
    // 1. 쿼리스트링으로 연도와 월을 받습니다. (없으면 현재 날짜 기준)
    const today = new Date();
    const currentYear = req.query.year ? parseInt(req.query.year) : today.getFullYear();
    const currentMonth = req.query.month ? parseInt(req.query.month) : today.getMonth() + 1;

    // 2. 날짜 계산
    // 이번 달의 1일
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    // 이번 달의 마지막 날 (다음 달의 0일로 설정하면 이번 달 마지막 날이 나옵니다)
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);

    // 1일의 요일 (0: 일요일, 1: 월요일 ... 6: 토요일) -> 달력 앞쪽 빈칸 채우기용
    const startDayOfWeek = firstDayOfMonth.getDay();
    // 이번 달의 총 일수 (28, 30, 31 등)
    const totalDays = lastDayOfMonth.getDate();

    // 3. 이전 달, 다음 달 계산 (링크용)
    // Date 객체는 월을 0부터 시작하므로 계산 시 주의
    const prevDate = new Date(currentYear, currentMonth - 1 - 1, 1);
    const nextDate = new Date(currentYear, currentMonth - 1 + 1, 1);

    res.render('index', { 
        title: '일정 관리 서버',
        user: req.user,
        year: currentYear,
        month: currentMonth,
        startDayOfWeek: startDayOfWeek, // 달력 시작 전 빈칸 개수
        totalDays: totalDays,           // 이번 달 날짜 개수
        prevYear: prevDate.getFullYear(),
        prevMonth: prevDate.getMonth() + 1,
        nextYear: nextDate.getFullYear(),
        nextMonth: nextDate.getMonth() + 1,
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
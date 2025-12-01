// routes/page.js

const express = require('express');
const router = express.Router();
const { isNotLoggedIn } = require('./middlewares');
const { Schedule } = require('../models');

// 공휴일 목록 (2025~2026년, 대체공휴일 포함)
const holidays = {
    // 2025년
    '2025-1-1': '신정',
    '2025-1-28': '설날 연휴', '2025-1-29': '설날', '2025-1-30': '설날 연휴',
    '2025-3-1': '삼일절', '2025-3-3': '삼일절 대체공휴일',
    '2025-5-5': '어린이날', '2025-5-6': '부처님오신날 대체공휴일', // 5.5 부처님오신날 겹침
    '2025-6-6': '현충일',
    '2025-8-15': '광복절',
    '2025-10-3': '개천절',
    '2025-10-5': '추석 연휴', '2025-10-6': '추석', '2025-10-7': '추석 연휴', '2025-10-8': '추석 대체공휴일',
    '2025-10-9': '한글날',
    '2025-12-25': '성탄절',

    // 2026년
    '2026-1-1': '신정',
    '2026-2-16': '설날 연휴', '2026-2-17': '설날', '2026-2-18': '설날 연휴',
    '2026-3-1': '삼일절', '2026-3-2': '삼일절 대체공휴일',
    '2026-5-5': '어린이날',
    '2026-5-24': '부처님오신날', '2026-5-25': '부처님오신날 대체공휴일',
    '2026-6-3': '전국동시지방선거',
    '2026-6-6': '현충일',
    '2026-8-15': '광복절', '2026-8-17': '광복절 대체공휴일',
    '2026-9-24': '추석 연휴', '2026-9-25': '추석', '2026-9-26': '추석 연휴',
    '2026-10-3': '개천절', '2026-10-5': '개천절 대체공휴일',
    '2026-10-9': '한글날',
    '2026-12-25': '성탄절',
};

// 메인 페이지 (달력 표시)
router.get('/', async (req, res, next) => {
    const now = new Date();
    const realYear = now.getFullYear();
    const realMonth = now.getMonth() + 1;
    const realDate = now.getDate();

    const currentYear = req.query.year ? parseInt(req.query.year) : realYear;
    const currentMonth = req.query.month ? parseInt(req.query.month) : realMonth;

    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const prevDate = new Date(currentYear, currentMonth - 1 - 1, 1);
    const nextDate = new Date(currentYear, currentMonth - 1 + 1, 1);

    let schedules = [];
    if (req.user) {
        try {
            schedules = await Schedule.findAll({
                where: { userId: req.user.id },
            });
        } catch (error) {
            console.error(error);
            next(error);
        }
    }

    res.render('index', { 
        title: '일정 관리 서버',
        user: req.user,
        year: currentYear,
        month: currentMonth,
        startDayOfWeek,
        totalDays,
        prevYear: prevDate.getFullYear(),
        prevMonth: prevDate.getMonth() + 1,
        nextYear: nextDate.getFullYear(),
        nextMonth: nextDate.getMonth() + 1,
        schedules,
        
        realYear,
        realMonth,
        realDate,
        holidays,
    });
});

// 회원가입 페이지 (GET /join)
router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', {
        title: '회원가입',
        joinError: req.query.error,
    });
});

// 로그인 페이지 (GET /login)
router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('login', {
        title: '로그인',
        loginError: req.query.error,
    });
});

module.exports = router;
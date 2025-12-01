// routes/middlewares.js

// 로그인 상태일 때 접근 불가 (예: 회원가입, 로그인 페이지)
exports.isNotLoggedIn = (req, res, next) => { // <-- exports.isNotLoggedIn
    if (!req.isAuthenticated()) {
        next(); // 로그인 안 했으면 통과
    } else {
        const message = '이미 로그인한 상태입니다.';
        res.redirect(`/?error=${message}`); 
    }
};

// 로그인 상태일 때만 접근 가능 (예: 일정 등록, 마이페이지)
exports.isLoggedIn = (req, res, next) => { // <-- exports.isLoggedIn
    if (req.isAuthenticated()) {
        next(); // 로그인 했으면 통과
    } else {
        const message = '로그인이 필요합니다.';
        res.redirect(`/login?error=${message}`); 
    }
};
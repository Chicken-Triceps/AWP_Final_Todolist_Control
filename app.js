// app.js

// 1. 필요한 모듈 불러오기
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

const session = require('express-session'); // 세션 관리를 위한 모듈
const passport = require('passport'); // Passport 모듈

// Passport 설정 모듈 불러오기
const passportConfig = require('./passport'); 
passportConfig(passport); // Passport 설정 함수 실행

// 라우터 불러오기
const pageRouter = require('./routes/page'); // 페이지 라우터 (메인/로그인/회원가입 화면)
const userRouter = require('./routes/user'); // 사용자 처리 라우터 (JOIN/LOGIN/LOGOUT)

// 2. 환경 변수(.env) 로드
// 이 코드가 가장 먼저 실행되어 .env 파일의 변수들을 process.env 객체에 저장
dotenv.config();

// 3. 데이터베이스 모듈 불러오기 (Sequelize 연결)
const { sequelize } = require('./models');

// 4. Express 애플리케이션 생성
const app = express();

// 5. 서버 포트 설정 (환경 변수 또는 기본값 3000 사용)
app.set('port', process.env.PORT || 3000);

// 미들웨어 설정 ===================================================================================

// 6. 템플릿 엔진 설정 (ejs 사용)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 7. 정적 파일 경로 설정 (CSS, JS, 이미지 등)
app.use(express.static(path.join(__dirname, 'public')));

// 8. 요청 본문(Body) 파싱 설정
app.use(express.json()); // JSON 형식 데이터 처리
app.use(express.urlencoded({ extended: false })); // 폼 데이터 처리

// 9. 세션 설정
app.use(session({
    resave: false, // 변경사항이 없어도 세션 저장소에 다시 저장할지 여부
    saveUninitialized: false, // 세션에 저장할 내용이 없어도 세션을 만들지 여부
    secret: process.env.COOKIE_SECRET || 'todo_secret_key', // .env에 쿠키 암호화 키 추가 필요
    cookie: {
        httpOnly: true, // 자바스크립트로 접근 금지
        secure: false, // https가 아닌 환경에서도 사용 가능
    },
    name: 'session-cookie',
}));

// 10. Passport 미들웨어 등록 (세션 미들웨어 뒤에 위치해야 함)
app.use(passport.initialize()); // req.user, req.login, req.logout 등을 생성
app.use(passport.session()); // 세션에 Passport 정보를 저장 및 복원

// 데이터베이스 연결 확인 및 동기화 ====================================================================

// 서버 시작 시 DB 연결 및 테이블 동기화 시도
sequelize.sync({ force: false }) // force: false는 테이블이 이미 있어도 새로 만들지 않음을 의미합니다.
  .then(() => {
    console.log('데이터베이스 연결 성공 및 모델 동기화 완료.');
  })
  .catch((err) => {
    console.error('데이터베이스 연결 또는 동기화 오류:', err);
  });

// 라우터 연결 ================================================================================
app.use('/', pageRouter);       // GET /login, GET /join, GET / 요청 처리
app.use('/auth', userRouter);   // POST /user/join, POST /user/login, GET /user/logout 요청 처리


// 9. 에러 핸들러 (404 처리)
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

// 10. 최종 에러 처리 미들웨어
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 개발 환경에서만 에러 상세 정보 표시
    res.status(err.status || 500);
    res.render('error'); // error.ejs 템플릿 렌더링 (추후 생성 필요)
});


// 11. 서버 실행
app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 서버 대기 중...');
});
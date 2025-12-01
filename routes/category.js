// routes/category.js
const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { isLoggedIn } = require('./middlewares');

// 카테고리 추가
router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        const { name, color } = req.body;

        // [추가] 중복된 이름 검사
        const exCategory = await Category.findOne({
            where: { name, userId: req.user.id },
        });

        if (exCategory) {
            // 중복되면 경고창을 띄우고 뒤로가기
            return res.send('<script>alert("이미 존재하는 카테고리 이름입니다."); location.href="/";</script>');
        }

        await Category.create({
            name,
            color,
            userId: req.user.id,
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// [추가] 카테고리 이름 수정
router.patch('/:id', isLoggedIn, async (req, res, next) => {
    try {
        await Category.update({
            name: req.body.name,
        }, {
            where: { id: req.params.id, userId: req.user.id },
        });
        res.send('success');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 카테고리 삭제
router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        await Category.destroy({
            where: { id: req.params.id, userId: req.user.id },
        });
        res.send('success');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
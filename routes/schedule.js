// routes/schedule.js (전체 코드)

const express = require('express');
const router = express.Router();
const { Schedule, Category } = require('../models');
const { isLoggedIn } = require('./middlewares');

// 일정 추가 (POST /schedule)
router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        const { title, description, startDate, endDate, isAllDay, categoryIds } = req.body;
        
        // 1. 일정 생성
        const schedule = await Schedule.create({
            title,
            description,
            startDate,
            endDate,
            isAllDay: isAllDay === 'on',
            userId: req.user.id,
        });

        // 2. 카테고리 관계 설정
        if (categoryIds) {
            const categories = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
            await schedule.addCategories(categories);
        }

        res.send('success');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// [추가] 일정 수정 (PATCH /schedule/:id)
router.patch('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { title, description, startDate, endDate, isAllDay, categoryIds } = req.body;
        
        // 1. 일정 찾기 및 권한 확인
        const schedule = await Schedule.findOne({ 
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!schedule) {
            return res.status(404).send('Schedule not found or unauthorized');
        }

        // 2. Schedule 필드 업데이트
        await schedule.update({
            title,
            description,
            startDate,
            endDate,
            isAllDay: isAllDay === 'on',
        });
        
        // 3. 카테고리 관계 재설정 (기존 관계 모두 삭제 후 새로 설정)
        if (categoryIds) {
            const categories = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
            await schedule.setCategories(categories);
        } else {
            // 카테고리를 하나도 선택하지 않았으면 관계 모두 삭제
            await schedule.setCategories([]);
        }

        res.send('success');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// [추가] 일정 삭제 (DELETE /schedule/:id)
router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        await Schedule.destroy({
            where: { id: req.params.id, userId: req.user.id },
        });
        res.send('success');
    } catch (error) {
        console.error(error);
        next(error);
    }
});


module.exports = router;
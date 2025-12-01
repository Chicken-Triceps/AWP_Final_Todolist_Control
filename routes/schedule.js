// routes/schedule.js

const express = require('express');
const router = express.Router();
const { Schedule } = require('../models');
const { isLoggedIn } = require('./middlewares');

// 일정 추가 (POST /schedule)
router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        const { title, description, startDate, endDate } = req.body;
        
        await Schedule.create({
            title,
            description,
            startDate,
            endDate,
            userId: req.user.id,
        });

        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
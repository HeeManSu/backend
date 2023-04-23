import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import errorHandlerClass from "../utils/errorClass.js";
import { sendEmail } from "../utils/nodeEmail.js";
import Stats from "../models/Stats.js";

export const contact = catchAsyncError(async (req, res, next) => {

    const { name, email, message } = req.body;
    if (!name, !email, !message) {
        return next(new errorHandlerClass("All fields are mandatory", 400))
    }

    const to = process.env.MY_MAIL;
    const subject = "Contact from LearnUp"
    const text = `I am ${name} and my Email is ${email}. \n${message}`

    await sendEmail(to, subject, text);

    res.status(200).json({
        sucess: true,
        message: "Your message has been sent"
    })
})
export const courseRequest = catchAsyncError(async (req, res, next) => {
    const { name, email, course } = req.body;
    if (!name, !email, !course) {
        return next(new errorHandlerClass("All fields are mandatory", 400))
    }

    const to = process.env.MY_MAIL;
    const subject = "Request for a course from LearnUp"
    const text = `I am ${name} and my Email is ${email}. \n${course}`

    await sendEmail(to, subject, text);

    res.status(200).json({
        sucess: true,
        message: "Your request has been sent"
    })
})
export const getDashboard = catchAsyncError(async (req, res, next) => {


    const stats = await Stats.find({}).sort({
        createdAt: "desc"
    }).limit(12);

    const statsData = [];

    for (let i = 0; i < stats.length; i++) {
        statsData.unshift(stats[i]);
    }
    const requiredSize = 12 - stats.length;

    for (let i = 0; i < requiredSize; i++) {
        statsData.unshift({
            users: 0,
            subscription: 0,
            views: 0,
        })
    }

    const usersCount = statsData[11].users;
    const subscriptionCount = statsData[11].subscription;
    const viewsCount = statsData[[11]].views;

    let userPercentage = 0,
        viewPercentage = 0,
        subscriptionPercentage = 0

    let usersProfit = true,
        viewsProfit = true,
        subscriptionProfit = true

    if (statsData[10].users === 0) userPercentage = usersCount * 100;
    if (statsData[10].views === 0) viewPercentage = viewsCount * 100;
    if (statsData[10].subscription === 0) subscriptionPercentage = subscriptionCount * 100;
    else {
        const difference = {
            users: statsData[11].users - statsData[10].users,
            views: statsData[11].views - statsData[10].views,
            subscription: statsData[11].subscription - statsData[10].subscription,
        }

        userPercentage = (difference.users / statsData[10].users) * 100;
        viewPercentage = (difference.views / statsData[10].views) * 100;
        subscriptionPercentage = (difference.subscription / statsData[10].subscription) * 100;

        if (userPercentage < 0) usersProfit = false;
        if (viewPercentage < 0) viewsProfit = false;
        if (subscriptionPercentage < 0) subscriptionProfit = false;
    }

    res.status(200).json({
        sucess: true,
        stats: statsData,
        usersCount,
        subscriptionCount,
        viewsCount,
        subscriptionPercentage,
        viewPercentage,
        userPercentage,
        subscriptionProfit,
        viewsProfit,
        usersProfit,
    })
})
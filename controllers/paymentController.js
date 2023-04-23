import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import UserModel from "../models/UserModel.js";
import errorHandlerClass from "../utils/errorClass.js";
import { instance } from "../server.js"
import Payment from "../models/Payment.js";
import crypto from "crypto"

export const buySubscription = catchAsyncError(async (req, res, next) => {

    const user = await UserModel.findById(req.user._id);

    if (user.role === "admin") {
        return next(new errorHandlerClass("Admin can't buy subscription", 400))
    }

    const plan_id = process.env.PLAN_ID || "plan_7wAosPWtrkhqZw"
    const subscription = await instance.subscriptions.create({
        plan_id,
        customer_notify: 1,
        total_count: 12,
    })

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(201).json({
        sucess: true,
        subscriptionId: subscription.id,
    })
})


export const paymentverfication = catchAsyncError(async (req, res, next) => {

    const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } = req.body;

    const user = await UserModel.findById(req.user._id);

    const subscription_id = user.subscription.id;

    const generate_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(razorpay_payment_id + " " + subscription_id, "utf-8")
        .digest("hex");


    const isAuthentic = generate_signature === razorpay_signature;

    if (!isAuthentic) {
        return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);
    }

    //database

    await Payment.create({

        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id
    })

    user.subscription.status = "active";


    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?referene=${razorpay_payment_id}`);
})

export const getRazorPayKey = catchAsyncError(async (req, res, next) => {
    res.status(200).json({
        sucess: true,
        key: process.env.RAZORPAY_API_KEY,
    })
})

export const cancelSubscription = catchAsyncError(async (req, res, next) => {

    const user = await UserModel.findById(req.user._id);
    const subscriptionId = user.subscription.id;
    let refund = false;
    await instance.subscriptions .cancel(subscriptionId);


    const payment = await Payment.findOne({
        razorpay_subscription_id: subscriptionId,
    })

    const gap = Date.now() - payment.createdAt;

    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

    if (refundTime > gap) {
        // await instance.payments.refund(payment.razorpay_payment_id);
        refund = true;
    }


    await payment.remove();

    user.subscription.id = undefined;
    user.subscription.status = undefined;

    await user.save();



    res.status(200).json({
        sucess: true,
       message:
       refund? "Subscription cancelled, you will receive refund within 7 days" : "subscription cancelled, Now refuned initiated as subscription was canelled after 7 days",
    })
})
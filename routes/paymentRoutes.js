import express from "express"
import { isAuthenticated } from "../middlewares/auth.js";
import { buySubscription, cancelSubscription, getRazorPayKey, paymentverfication } from "../controllers/paymentController.js";

const router = express.Router();

//Buy Subscriptions

router.route("/subscribe").get(isAuthenticated, buySubscription);


//verify payment and save reference in database
router.route("/paymentverfication").post(isAuthenticated, paymentverfication)

//Get Razorpay key
router.route("/razorpaykey").get(getRazorPayKey);


//Cancel Subscription
router.route("/subscribe/cancel").delete(isAuthenticated, cancelSubscription)



export default router;


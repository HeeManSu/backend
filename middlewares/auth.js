import Jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";
import errorHandlerClass from "../utils/errorClass.js";
import UserModel from "../models/UserModel.js";


export const isAuthenticated = catchAsyncError(async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) return next(new errorHandlerClass("Not logged in", 401));
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);

    // If the user is found, it adds the user object to the req object as req.user.This allows other middleware functions or route handlers to access the authenticated user's details.
    req.user = await UserModel.findById(decoded._id);
    next();
})

export const authorizeAdmin = (req, res, next) => {


    if (req.user.role !== "admin") {
        return next(new errorHandlerClass(`${req.user.role} is not allowed to access this resource`, 403));
    }
    next();
};


export const authorizeSubscribers = (req, res, next) => {


    if (req.user.subscription.status !== "active" && req.user.role !== "admin") {
        return next(new errorHandlerClass(`Only subscribers can accesss this resource`, 403));
    }
    next();
};
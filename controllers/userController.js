import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import errorClass from "../utils/errorClass.js"
import UserModel from "../models/UserModel.js"
import errorHandlerClass from "../utils/errorClass.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/nodeEmail.js";
import crypto from "crypto"
import CourseModel from "../models/CourseModel.js"
import cloudinary from "cloudinary"
import getDataUri from "../utils/dataUri.js";
import Stats from "../models/Stats.js";
import { stat } from "fs";


export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const file = req.file;

    console.log(name, email, password, file);


    if (!name || !email || !password || !file) {
        return next(new errorClass("Please enter all field", 400))
    }

    let user = await UserModel.findOne({ email });

    if (user) {
        return next(new errorHandlerClass("user already exist", 409));
    }

    //upload file on cloudinary
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)

    //To add new user in the database.
    user = await UserModel.create({
        name,
        email,
        password,
        avatar: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        },
    })

    //Without the jwt token . The user will not be able to use some of the protecte routes or do some particular actions.
    sendToken(res, user, "Registered Successfully", 201);
})


export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
        return next(new errorHandlerClass("Please enter all field", 400));

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) return next(new errorHandlerClass("Incorrect Email or Password", 401));

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
        return next(new errorHandlerClass("Incorrect Email or Password", 401));

    sendToken(res, user, `Welcome back, ${user.name}`, 200);
});


export const logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        //Cookie to null and deltes the cookie in the browser now.
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "Logged out successfully",
    })
})

export const getMyProfile = catchAsyncError(async (req, res, next) => {

    const user = await UserModel.findById(req.user._id);
    res.status(200).json({
        success: true,
        user,
    })
})
export const changepassword = catchAsyncError(async (req, res, next) => {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return next(new errorHandlerClass("Please enter all fields", 400))
    }
    const user = await UserModel.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
        return next(new errorHandlerClass("Incorrect old password", 400));
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    })
})

export const updateProfile = catchAsyncError(async (req, res, next) => {

    const { name, email } = req.body;
    const user = await UserModel.findById(req.user._id);

    if (name) {
        user.name = name;
    }

    if (email) {
        user.email = email;
    }



    await user.save();
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
    })
})


export const updateprofilepicture = catchAsyncError(async (req, res, next) => {

    const file = req.file;
    const user = await UserModel.findById(req.user._id);
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "profile picture updated successfully",
    })
})

export const forgetPasswrod = catchAsyncError(async (req, res, next) => {


    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
        return next(new errorHandlerClass("No user with give email found", 400));
    }

    const resetToken = await user.getResetToken();
    await user.save();
    // http://localhost:3000/resetpassword/dhfajfhdjhdkalhfjdh
    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `Click on the link to reset your password. ${url}. if you have not requested then please ignore.`
    //send token via email
    await sendEmail(user.email, "LearnUp Reset password", message)
    res.status(200).json({
        success: true,
        message: `reset token has been sent to ${user.email}`,
    })
})
export const resetPassword = catchAsyncError(async (req, res, next) => {

    const { token } = req.params;

    const resetPasswordToken = crypto.createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await UserModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        },

    })
    if (!user) {
        return next(new errorHandlerClass("Token is invalid or has been expired"));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    user.save();

    res.status(200).json({
        success: true,
        message: "password changed successfully",
        token
    })
})


export const addtoplaylist = catchAsyncError(async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    const course = await CourseModel.findById(req.body.id);
    if (!course) {
        return next(new errorHandlerClass("Invalid course ID"), 404);
    }

    const itemExist = user.playlist.find((item) => {
        if (item.course.toString() === course._id.toString()) {
            return true;
        }
    })

    if (itemExist) {
        return next(new errorHandlerClass("Item Already exist", 409));
    }

    user.playlist.push({
        course: course._id,
        poster: course.poster.url,
    })

    await user.save();
    res.status(200).json({
        success: true,
        message: "Added to playlist",
    })
})

export const removefromplaylist = catchAsyncError(async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    const course = await CourseModel.findById(req.query.id);
    if (!course) {
        return next(new errorHandlerClass("Invalid course ID"), 404);
    }


    const newPlaylist = user.playlist.filter((item) => {
        if (item.course.toString() !== course._id.toString()) {
            return item;
        }
    })

    user.playlist = newPlaylist;

    await user.save();
    res.status(200).json({
        success: true,
        message: "Remove from playlist",
    })
})


//Admin Controllers
export const getAllUsers = catchAsyncError(async (req, res, next) => {

    const users = await UserModel.find({})

    res.status(200).json({
        success: true,
        users,
    })
})


export const updateUserRole = catchAsyncError(async (req, res, next) => {

    const user = await UserModel.findById(req.params.id)

    if (!user) {
        return next(new errorHandlerClass("User not found", 404));
    }

    if (user.role === "user") {
        user.role = "admin"
    } else {
        user.role = "user";
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "role updated",
    })
})


export const deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await UserModel.findById(req.params.id)

    if (!user) {
        return next(new errorHandlerClass("User not found", 404));
    }

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    //Cancel subscription
    await user.remove();

    res.status(200).json({
        success: true,
        message: "user deleted successfully",
    })
})


export const deleteMyProfile = catchAsyncError(async (req, res, next) => {

    const user = await UserModel.findById(req.user._id)

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    //Cancel subscription
    await user.remove();

    res.status(200)
        .cookie("token", null, {
            expires: new Date(Date.now()),
        })
        .json({
            success: true,
            message: "user deleted successfully",
        })
})

UserModel.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({
        createdAt: "disc"
    }).limit(1);

    const subscription = await UserModel.find({
        "subscription.status": "active"

    })

    stats[0].users = await UserModel.countDocuments();
    stats[0].subscription = subscription.length;
    stats[0].createdAt = new Date(Date.now());

    await stats.save();
})




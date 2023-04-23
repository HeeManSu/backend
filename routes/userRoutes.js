import express from 'express'
import { login, register, logout, changepassword, getMyProfile, updateProfile, updateprofilepicture, forgetPasswrod, resetPassword, addtoplaylist, removefromplaylist, getAllUsers, updateUserRole, deleteUser, deleteMyProfile } from '../controllers/userController.js';

import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';
const router = express.Router();

//To register a user.
router.route("/register").post(singleUpload, register).get((req, res) => {
    res.send("This is register request to register an user")
})

//Login
router.route("/login").post(login).get((req, res) => {
    res.send("This request is for login")
})

//LogOut
router.route("/logout").get(logout)


//Get my profile
router.route("/me").get(isAuthenticated, getMyProfile).get((req, res) => {
    res.send("This routes is for get my profile of an user")
})


router.route("/me").delete(isAuthenticated, deleteMyProfile).get((req, res) => {
    res.send("This routes is for get my profile of an user")
})

//ChangePassword
router.route("/changepassword").put(isAuthenticated, changepassword).get((req, res) => {
    res.send("This routes is for changing password")
})

//UpdatePassword
router.route("/updateprofile").put(isAuthenticated, updateProfile).get((req, res) => {
    res.send("This routes is for updating profile")
})
//UpdateProfilePicture
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload, updateprofilepicture)

//ForgetPasswrod
router.route("/forgetpassword").post(forgetPasswrod).get((req, res) => {
    res.send("This routes is for forget password")
})
//ResetPassword
router.route("/resetpassword/:token").put(resetPassword).get((req, res) => {
    res.send("This routes is for reset password")
})

//AddtoPlaylist
router.route("/addtoplaylist").post(isAuthenticated, addtoplaylist).get((req, res) => {
    res.send("This routes is for adding course to the playlist")
})
//RemoveFromPlaylist

router.route("/removefromplaylist").delete(isAuthenticated, removefromplaylist).get((req, res) => {
    res.send("This routes is for reset password")
})

router.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUsers)


router.route("/admin/user/:id").put(isAuthenticated, authorizeAdmin, updateUserRole).delete(isAuthenticated, authorizeAdmin, deleteUser)

export default router;
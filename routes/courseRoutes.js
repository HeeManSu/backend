import express from "express"
import { getAllCourses, createcourse, getCourseLecture, addLecture, deleteCourse, deleteLecutre } from "../controllers/courseController.js";
import singleUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticated, authorizeSubscribers } from "../middlewares/auth.js";

const router = express.Router();

//Get all courses without lectures.
router.route("/courses").get(getAllCourses);

//create new course only admin.
router.route("/createcourse")
    .post(isAuthenticated, authorizeAdmin, singleUpload, createcourse)
    .get((req, res) => {
        res.send("This is a GET request to the createcourse route");
    });
//Add lectures, delete course, get course details,
router.route("/course/:id").get(isAuthenticated, authorizeSubscribers, getCourseLecture).
    post(isAuthenticated, authorizeAdmin, singleUpload, addLecture).delete(isAuthenticated, authorizeAdmin, deleteCourse);


// Delete lectures

router.route("/lecture").delete(isAuthenticated, authorizeAdmin, singleUpload, deleteLecutre)



export default router;
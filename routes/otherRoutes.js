import express from "express"

import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js"
import { contact, courseRequest, getDashboard } from "../controllers/otherController.js";

const router = express.Router();



//Contact form
router.route("/contact").post(contact)

//Request Form
router.route("/courserequest").post(courseRequest)


//Get Admin Dashboard stats

router.route("/admin/stats").get(isAuthenticated, authorizeAdmin, getDashboard)

export default router;
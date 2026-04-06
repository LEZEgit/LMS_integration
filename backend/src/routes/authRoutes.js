import express from "express";
import { login, logout, refreshToken } from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginSchema } from "../validators/authValidator.js";

const router = express.Router();

// router.post("/register", register); // moved to src/routes/adminRoutes

router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
// router.post("/forgot-passoword", forgotPassoword); 

export default router;

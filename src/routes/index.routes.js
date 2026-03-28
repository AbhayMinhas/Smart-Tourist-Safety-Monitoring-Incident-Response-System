import express from "express";
import authRouter from "../modules/auth/auth.routes.js";
import userRouter from "../modules/users/user.routes.js";
import emergencyRouter from "../modules/emergencies/emergency.routes.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/emergency", emergencyRouter);
router.get("/map",protect,(req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  res.render("map",{token});
});

router.get("/health", (req, res) => {
  res.json({ success: true, message: "OK" });
});

// root route
router.get("/", (req, res) => {
  res.json({ success: true, message: "API running" });
});

export default router;

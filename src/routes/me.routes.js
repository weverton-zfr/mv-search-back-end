import express from 'express'
import { getMe } from '../controllers/me.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import axios from "axios";

const router = express.Router()

router.get('/me', authMiddleware, getMe)



router.get("/my-ip", async (req, res) => {
  try {
    const { data } = await axios.get("https://api.ipify.org?format=json");
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar IP" });
  }
});


export default router
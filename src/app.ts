import CookieParser from "cookie-parser";
import { pool } from "./db";
import cors from "cors";
import express, {
    type Application,
    type Request,
    type Response,
} from "express";
const app: Application = express()
app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: "http://localhost:3000",
    }),
);

app.get('/',(req,res)=>{
    res.send("hellow world")
})


app.post('/api/auth/signup', async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    try {
        const result = await pool.query(`
          INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, created_at, updated_at
        `, [name, email, password, role]);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        })
    } catch (error:any) {
      res.status(500).json({
        success: false,
        message: error.message,
        error:error
      })
    }
})

export default app;
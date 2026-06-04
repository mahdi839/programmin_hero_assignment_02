import CookieParser from "cookie-parser";
import { pool } from "./db";
import cors from "cors";
import express, {
    type Application,
    type Request,
    type Response,
} from "express";
import { userRoute } from "./modules/user/user.route";
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


app.use("/api/auth/signup", userRoute);
app.use("/api/auth", authRoute);

export default app;
import { pool } from "../../db";
import bcrypt from "bcrypt";
import type { IUser } from "./user.interface";

const userCreateService = async (payload:IUser) => {
    const { name, email, password, role } = payload;
    const hashPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(`
          INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, created_at, updated_at
        `, [name, email, hashPassword, role]);
    return result;
}

export const  userService ={
    userCreateService
}
import bcrypt from "bcrypt"
import { pool } from "../../db"
import jwt from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: { email: string, password: string }) => {
    const { email, password } = payload;
    const userData = await pool.query(`
          SELECT * FROM users WHERE email=$1
        `,
        [email],
    );

    // check if user exist or not
    if (userData.rows.length === 0) {
        throw new Error("Invalid Credentials!")
    }

    // compare customer pass and db pass
    const user = userData.rows[0];
    const matchPass = await bcrypt.compare(password, user.password);

    if (!matchPass) {
        throw new Error("Invalid Credentials!")
    }

    // generate jwt token
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwt.sign(jwtPayload, config.secret as string, {
        expiresIn: "1d",
    });
    return {
        token:accessToken,
        user:{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at:user.created_at,
            updated_at:user.updated_at,
            } 
         };
}

export const authService = {
    loginUserIntoDB,
};
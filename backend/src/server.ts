const dotenv = require("dotenv");
const pool = require("./config/database");
const app = require("./app");
/*import type { Request, Response } from "express";*/

//全局拦截中间件
/*app.use((req: Request, res: Response): void => {
  console.log('🔥 server.ts 捕获请求:', req.method, req.url);
  res.send('server.ts interceptor');
});*/

dotenv.config();

/*const PORT = Number(process.env.PORT) || 3000;重复监听*/

async function startServer() {
  try {
    const connection = await pool.getConnection();

    console.log("Connected to the database successfully.");

    connection.release(); // Release the connection back to the pool    

 /*   app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });*/

  } catch (error) {

    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with an error code
    
  }
}

startServer();

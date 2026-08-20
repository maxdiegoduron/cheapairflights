import express from "express";
import cors from "cors";
import { env } from "./config/env";
import pricesRouter from "./routes/prices";

const app = express();

app.use(cors({ origin: env.allowedOrigin }));
app.use(express.json());
app.use("/api", pricesRouter);

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});

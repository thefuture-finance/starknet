import express from "express";
import userRoutes from "./routes/userRoutes";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;

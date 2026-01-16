process.loadEnvFile();
import "./env.js";
import express from "express";
import vento from "ventojs";
import { db } from "./db/db.js";
import { usersTable } from "./db/schema.js";
import { sessionMiddleware } from "./middleware/sessionStore.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { devMiddleware } from './middleware/devMiddleware.js';

const templates = vento({
  includes: "./src/views/",
});

const app = express();
app.set("trust proxy", 1);
console.log(`App running in: ${app.get("env")}`);


if (process.env.NODE_ENV !== "production") {
  app.use(devMiddleware(templates));
}

app.use(sessionMiddleware);
app.use(authMiddleware);

app.get("/", async (req, res) => {
  // Loading templates in each request for dev
  const template = await templates.load("pages/index.vto");
  const result = await template();
  const users = await db.select().from(usersTable);

  req.session.userId = req.session.userId ?? users[0]?.id;

  res.type("html").send(result.content);
});

app.get("/up", async (req, res) => {
  console.log("up");
  res.sendStatus(200);
});

const port = 3000;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

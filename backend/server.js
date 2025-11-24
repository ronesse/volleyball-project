require("dotenv").config();
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Basic ")) {
    res.set("WWW-Authenticate", "Basic realm='Admin Area'");
    return res.status(401).send("Authentication required.");
  }

  const base64 = auth.replace("Basic ", "");
  const [user, pass] = Buffer.from(base64, "base64").toString().split(":");

  if (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASS
  ) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
}

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Statisk frontend (public/)
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

// API-ruter
const teamsRouter = require("./routes/teams");
const playersRouter = require("./routes/players");

app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);

// Fallback – send index om noen går direkte til /admin osv. (valgfritt)
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});

const express = require("express");
const session = require("express-session");
const path = require("path");

const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { useSession } = require("./middlewares/authMiddleware");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "easycar",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(useSession);

app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/cars", carRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);

app.get("/my-bookings", (req, res) => {
  res.redirect("/bookings/my-bookings");
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(port, () => {
  console.log("Server chạy tại http://localhost:" + port);
});

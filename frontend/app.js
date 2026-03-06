const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");

// Controllers
const dashboardController = require("./controllers/dashboardController");
const productController = require("./controllers/productController");

// Routes
const supplierRoutes = require("./routes/suppliers");
const employeeRoutes = require("./routes/employeeRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const reportRoutes = require("./routes/report");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // ✅ เพิ่ม

// ================= BASIC SETUP =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// ================= SESSION =================
app.use(
  session({
    name: "frontend.sid",
    secret: "comstock_secret",
    resave: false,
    saveUninitialized: false,
  }),
);

// ================= GLOBAL VARIABLES =================
app.use((req, res, next) => {
  res.locals.currentPage = req.path;
  res.locals.user = req.session.user;
  next();
});

// ================= LOGIN MIDDLEWARE =================
function isLoggedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// ================= AUTH ROUTES =================
app.use("/", authRoutes);

// ================= ROUTES =================

// Root → Dashboard (ต้อง login ก่อน)
app.get("/", isLoggedIn, (req, res) => {
  res.redirect("/dashboard");
});

// Dashboard
app.get("/dashboard", isLoggedIn, dashboardController.getDashboard);

// Products
app.get("/products", isLoggedIn, productController.getProducts);
app.post("/products", isLoggedIn, productController.addProduct);
app.get("/products/edit/:id", isLoggedIn, productController.editForm);
app.post("/products/update/:id", isLoggedIn, productController.updateProduct);
app.delete("/products/:id", isLoggedIn, productController.deleteProduct);
app.post("/products/sell/:id", isLoggedIn, productController.sellProduct);

// Other Routes (ต้อง login ก่อนทั้งหมด)
app.use("/transactions", isLoggedIn, transactionRoutes);
app.use("/suppliers", isLoggedIn, supplierRoutes);
app.use("/employees", isLoggedIn, employeeRoutes);
app.use("/users", isLoggedIn, userRoutes); // ✅ ระบบเพิ่มผู้ใช้ (Admin Only)
app.use("/reports", isLoggedIn, reportRoutes);

// ================= START SERVER =================
app.listen(7000, () => {
  console.log("Server running on http://localhost:7000");
});

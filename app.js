const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const helper = require("./config/helper");
const exphbs = require("express-handlebars");
const app = express();

const port = 3000;

//các middle ware
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    helpers: {
      compare: helper.compare,
      modifyImg: helper.modifyImg,
      formatTime: helper.formatTime,
      status: helper.status,
    },
  })
);

app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "my-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 60 * 60 * 24 * 1000,
    },
  })
);
app.use(cookieParser());

//các route
const authRoutes = require("./route/routeAuth");
const homeRoutes = require("./route/routeHome");
const userRoutes = require("./route/routeUser");
const adminRoutes = require("./route/routeAdmin");

//url login, register
app.use("/", homeRoutes);

//đăngt kí đăng nhập
app.use("/auth", authRoutes);

//các chức năng của user
app.use("/user", userRoutes);

//admin
app.use("/admin", adminRoutes);

app.use((req, res, next) => {
  return res.render("error", { layout: false }); // nếu không tồn tại thì render trang error
});


app.listen(port, () => {
  console.log(`Server running on: http://localhost:${port}`);
});

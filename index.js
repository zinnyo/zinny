const express = require("express");
const app = express();
var cloudinary = require("cloudinary").v2;
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const session = require("express-session");

const ADMIN = "4700073763368586";

const mongoose = require("mongoose");

cloudinary.config({
  cloud_name: "dxtau2gip",
  api_key: "498898116344181",
  api_secret: "YF1YV26w0LUA7tKX4HvoULN0Pn0",
});

mongoose
  .connect(
    "mongodb+srv://admin:admin@cluster0.quzoc.mongodb.net/zinny?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("db connected");
  });

const cors = require("cors");

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload());

app.set("trust proxy", 1);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cors({ origin: true }));
// app.use("/public", express.static(path.join(__dirname, "static")));
app.use(express.static(__dirname + "/public"));
app.set("views", "./views");
app.set("view engine", "ejs");

const adminRoute = require("./routes/admin");
const customerRoute = require("./routes/customer");

app.get("/getstarted/:id", (req, res) => {
  const { id } = req.params;

  if (id == ADMIN) {
    return res.json({
      redirect_to_blocks: ["admin_task"],
    });
  } else {
    return res.json({
      redirect_to_blocks: ["customer_task"],
    });
  }
});

app.post("/add", upload.single("file"), (req, res, next) => {
  console.log(req.body, req.file);
});

app.use("/admin", adminRoute);
app.use("/customer", customerRoute);

app.listen(PORT, () => {
  console.log("Server started");
});

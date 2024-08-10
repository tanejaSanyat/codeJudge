const express = require("express");
const { DBConnection } = require("./database/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./models/Users");
const Contest = require("./models/Contest");
const bodyParser = require("body-parser");
const executeCpp = require("./src/executeCpp.js");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const generateFile = require("./src/generateFile");
const executeCppForRun = require("./src/executeCppForRun.js");
const executePythonForRun = require("./src/executePythonForRun.js");
const executePython = require("./src/executePython");
const executeJavaForRun = require("./src/executeJavaForRun");
const executeJava = require("./src/executeJava");
const { log } = require("console");
const fs = require("fs");
// creating express app
const app = express();

// middlewares
const corsOptions = {
  origin: "http://localhost:5174", // Replace with your frontend URL
  credentials: true, // Allow credentials (cookies)
};

app.use(cors(corsOptions));
app.use(express.json());
// app.use(cors());
// app.use(cors({ credentials: true }))
// {
//     origin: "http://localhost:5173", // Replace with your frontend URL
//     credentials: true, // Allow credentials (cookies)
//   }
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Multer configuration for image storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (
      file.fieldname.startsWith("images-") ||
      file.fieldname === "contestImage" ||
      file.fieldname === "profilePhoto"
    ) {
      cb(null, "src/uploads/images/");
    } else {
      cb(null, "src/uploads/");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

const imagesDir = path.join(__dirname, "src/uploads/images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

app.post("/register", async (req, res) => {
  try {
    // get data from request body
    const { username, email, password, adminRole } = req.body;

    // check all data received
    if (!(username && email && password)) {
      return res.status(400).send("Please enter all the required fields");
    }

    // check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(email);
      return res.status(400).send("User already exists. Enter a new email.");
    }

    // encrypt password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // save user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      adminRole: adminRole || false,
    });

    // generate token for user
    const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    // send the response and object
    user.password = undefined;
    res
      .status(201)
      .json({ message: "New user successfully created", user, token });
  } catch (err) {
    console.log("Error while registering", err);
    res.status(500).send("Internal Server Error");
  }
});

// Example of setting cookie in Node.js (Express.js)
app.post("/login", async (req, res) => {
  try {
    // get details
    const { email, password } = req.body;

    // find user
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .send("You are not registered. Please register to gain access.");
    }

    // compare passwords
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).send("Wrong password");
    }

    // generate token for user
    const token = jwt.sign(
      { userEmail: existingUser.email, role: existingUser.adminRole },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      secure: true,
      sameSite: "None",
      maxAge: 3600000,
    });
    res.json({
      userEmail: existingUser.email,
      token,
      adminRole: existingUser.adminRole,
    }); // Return the user's role along with the token
  } catch (err) {
    console.log("Error while logging in", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/logout", (req, res) => {
  // Logic to handle logout, e.g., invalidating tokens, clearing session
  res.clearCookie("token"); // clear the cookie from the client
  res.clearCookie("role"); // clear the cookie from the client
  res.status(200).json({ message: "Logout successful" });
  res.status(200).send({ message: "Logout successful" });
});

// Static files route for uploaded files
// const uploadDir = path.join(${__dirname}/src, "uploads")
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(codeDir, { recursive: true });
// }

app.post("/run", async (req, res) => {
  const { language = "cpp", code, pretestIp = "" } = req.body;
  if (code === "") {
    return res
      .status(400)
      .json({ success: false, message: "Do write some code to submit!" });
  }
  try {
    console.log("pretests are: ", pretestIp);
    const filePath = generateFile(language, code);
    console.log("before output ");

    let output;
    if (language === "cpp") {
      output = await executeCppForRun(filePath, pretestIp);
    } else if (language === "python") {
      output = await executePythonForRun(filePath, pretestIp);
    } else if (language === "java") {
      output = await executeJavaForRun(filePath, pretestIp);
    }

    console.log("after output ");
    res.send({ filePath, output });
  } catch (err) {
    console.error("Error executing code:", err);
    res.status(500).json({
      success: false,
      message: "Error executing code",
      error: err.message,
    });
  }
});

//user profile
// Route to fetch user by email
app.get("/user", async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: err.message });
  }
});

// Route to check user email in contest registrations and register if not present

app.listen(3000, async () => {
  console.log("Server is listening on port 3000");
  console.log("Connecting DB");
  await DBConnection();
});

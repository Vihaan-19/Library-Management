const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes=require("./routes/authRoutes");
const adminRoutes=require("./routes/adminRoutes");
const userRoutes=require("./routes/userRoutes");

const PORT = 3000;

dotenv.config();

mongoose.connect(process.env.mongo_uri, { useUnifiedTopology: true })
    .then((result) => {
        app.listen(PORT, () => { console.log(`Connected to server ${PORT} and database `) });
    })
    .catch((err) => { console.log(err) });

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/admin",adminRoutes);

app.get('/', (req, res) => {
    res.send("Welcome to Home Page");
})





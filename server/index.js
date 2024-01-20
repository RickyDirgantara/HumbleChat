const express = require("express");
const cors = require("cors");
const mongoose = require ("mongoose");
const userRoute = require("./Routes/userRoute");

const app = express();
require("dotenv").config() 


app.use(express.json());
app.use(cors());
app.use("/api/user", userRoute);

app.get("/", (req, res) =>{
    res.send("Welcome to Humblechat");
});



const port = process.env.PORT || 8080;
const uri = process.env.ATLAS_URI;

app.listen(port, (req, res) => {
    console.log(`Server running on port: ${port}`);
});

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log("MongoDB connection established")).catch((error) => consoler.log("MongoDB connection failure: ", error.message));

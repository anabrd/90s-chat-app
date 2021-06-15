const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const http = require("http");

app.listen(port, () => console.log(`Server is running on port ${port}`));

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.get("/about", (req, res) => {
    res.sendFile("about.html", {root: __dirname + "/public" });
});


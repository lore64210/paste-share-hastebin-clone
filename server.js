require("dotenv").config();

const path = require("path");

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const Pastebin = require("./models/pastebin");

const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
    res.render("index", {
        pastebin: "Escribi lo que quieras, guardalo y comparti el enlace!",
        id: null,
    });
});

app.get("/saved/:id", async (req, res) => {
    const id = req.params?.id;
    if (!id) {
        res.redirect("/");
    }
    const pastebin = await Pastebin.findOne({ _id: id });
    if (!pastebin) {
        res.redirect("/");
    }
    res.render("index", { pastebin: pastebin.text, id: pastebin._id });
});

app.post("/pastebin", async (req, res) => {
    try {
        const id = req.body?.id;
        const text =
            req.body?.text?.length > 3500
                ? req.body?.text.substring(0, 3500)
                : req.body?.text;
        if (id) {
            await Pastebin.updateOne({ _id: id }, { text });
            res.redirect(`/saved/${id}`);
        } else {
            const newPastebin = await Pastebin.create({ text });
            res.redirect(`/saved/${newPastebin._id}`);
        }
    } catch (e) {
        console.error(e.message);
        res.redirect("/");
    }
});

app.listen(process.env.PORT || 5000);

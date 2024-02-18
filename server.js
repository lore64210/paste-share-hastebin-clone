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
    await Pastebin.updateOne(
        { _id: id },
        { visitCount: pastebin.visitCount + 1, lastVisited: Date.now() }
    );
    res.render("index", { pastebin: pastebin.text, id: pastebin._id });
});

app.post("/pastebin", async (req, res) => {
    try {
        const id = req.body?.id;
        const text =
            (req.body?.text ?? "").length > 3500
                ? req.body?.text.trim().substring(0, 3500).trim()
                : req.body?.text.trim();
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

const cron = require("node-cron");
async function deleteUnvisited() {
    try {
        console.log("Cron job executed at:", new Date().toLocaleString());
        const limit = new Date();
        limit.setMonth(limit.getMonth() - 1);
        const results = await Pastebin.deleteMany({
            lastVisited: { $lt: limit },
        });
        console.log(results);
    } catch (e) {
        console.error(e.message);
    }
}

//cron.schedule("* * * * *", () => deleteUnvisited()); //every minute for debug
cron.schedule("0 6 * * *", () => deleteUnvisited()); // 6am everyday

app.listen(process.env.PORT || 5000);

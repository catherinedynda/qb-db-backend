import express from "express";
const router = express.Router();

router.get("/", function (req, res) {
    res.render("admin", { title: "QB DB Admin site" });
});

export default router;

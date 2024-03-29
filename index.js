// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

import express from "express";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import indexRouter from "./routes/index.js";
import adminRouter from "./routes/admin.js";
import nicknamesRouter from "./routes/nicknames.js";
import usersRouter from "./routes/users.js";
import membersRouter from "./routes/members.js";
import quoteesRouter from "./routes/quotees.js";
import searchRouter from "./routes/search.js";
import likesRouter from "./routes/likes.js";

const app = express();
const port = 4000;

// view engine setup
app.set("views", "./views");
app.set("view engine", "pug");
// app.use(express.bodyParser());
// app.use(express.json());

const corsOptions = {
    // origin: "https://qb-db-frontend-git-dev-catherinedynda.vercel.app/",
    // origin: process.env.ALLOWED_ORIGINS,
    origin: true,
};

app.use(cors(corsOptions));

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/nicknames", nicknamesRouter);
app.use("/api/users", usersRouter);
app.use("/api/members", membersRouter);
app.use("/api/quotees", quoteesRouter);
app.use("/api/search", searchRouter);
app.use("/api/likes", likesRouter);

app.use(express.static("/public"));

// app.use(logger("dev"));
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    // res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

app.listen(port, () => {
    console.log(`QB DB backend listening on port ${port}`);
});

// module.exports = app;

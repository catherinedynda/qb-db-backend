// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

import express from "express";
import bodyParser from "body-parser";
import path from "path";

import indexRouter from "./routes/index.js";
import nicknamesRouter from "./routes/nicknames.js";
import usersRouter from "./routes/users.js";

const app = express();
const port = 4000;

// view engine setup
app.set("views", "./views");
app.set("view engine", "pug");
// app.use(express.bodyParser());
// app.use(express.json());

app.use("/", indexRouter);
app.use("/nicknames", nicknamesRouter);
app.use("/users", usersRouter);

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
  console.log(`Example app listening on port ${port}`);
});

// module.exports = app;

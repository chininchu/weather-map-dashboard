"use strict";

require("dotenv").config();
var express = require("express");
var createError = require("http-errors");
var path = require("node:path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var projectRoot = process.cwd();

var app = express();
app.disable("x-powered-by");

// view engine setup
app.set("views", path.join(projectRoot, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(projectRoot, "public")));

// Avoid a noisy 404 when the browser looks for a site icon.
app.get("/favicon.ico", function (req, res) {
  res.sendStatus(204);
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

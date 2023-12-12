const axios = require("axios");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const http = require("http");
const https = require("https");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION", err);
  // Shutdown application
  // By doing server.close, we give the server time to finish all the request that are still pending or being handled
  server.close(() => {
    process.exit(1); // 0 = sucess ; 1 = uncaught exeption /// process.exit = abrupt way of closing the server
  });
});

dotenv.config({
  path: "./config.env",
});
const app = require("./app");

if (process.env.NODE_ENV === "production") {
  mongoose
    .connect(process.env.DATABASE_LOCAL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log("DB connection sucessfully");
    });
} else {
  const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
  );
  mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log("DB connection sucessfully");
    });
}

if (process.env.NODE_ENV === "production") {
  const privateKey = fs.readFileSync("cert/privkey.pem", "utf8");
  const certificate = fs.readFileSync("cert/cert.pem", "utf8");
  const ca = fs.readFileSync("cert/chain.pem", "utf8");

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
  };

  const httpServer = http.createServer(app);
  const httpsServer = https.createServer(credentials, app);

  httpServer.listen(80, () => {
    console.log("HTTP Server running on port 80");
  });

  httpsServer.listen(443, () => {
    console.log("HTTPS Server running on port 443");
  });
} else {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION", err.name, err);
  // Shutdown application
  // By doing server.close, we give the server time to finish all the request that are still pending or being handled
  server.close(() => {
    process.exit(1); // 0 = sucess ; 1 = uncaught exeption /// process.exit = abrupt way of closing the server
    // Here crash the application is optional, but in uncaught exeption is not optional.
  });
});

process.on("SIGTERM", () => {
  console.log("✋ SIGTERM RECEIVED. Shutting dow gracefully");
  server.close(() => {
    console.log("💥 Process terminated");
  });
});

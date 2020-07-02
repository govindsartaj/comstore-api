const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");

const { getAllStores, createOneStore } = require("./handlers/stores");
const {
  getAllUsers,
  signup,
  login,
  uploadUserImage,
} = require("./handlers/users");

// store routes
app.get("/stores", getAllStores);
app.post("/createStore", FBAuth, createOneStore);

// user routes
app.get("/users", getAllUsers);
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadUserImage);

exports.api = functions.https.onRequest(app);

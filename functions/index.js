const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");

const { getAllStores, createOneStore } = require("./handlers/stores");
const {
  signup,
  login,
  uploadUserImage,
  addUserInfo,
  getAuthenticatedUser
} = require("./handlers/users");

// store routes
app.get("/stores", getAllStores);
app.post("/createStore", FBAuth, createOneStore);

// user routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadUserImage);
app.post("/user", FBAuth, addUserInfo);
app.get('/user', FBAuth, getAuthenticatedUser);


exports.api = functions.https.onRequest(app);

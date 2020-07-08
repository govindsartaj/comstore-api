const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");

const {
  getAllStores,
  createOneStore,
  getStore,
  addItemToStore,
  getNearbyStore,
} = require("./handlers/stores");
const {
  signup,
  login,
  uploadUserImage,
  addUserInfo,
  getAuthenticatedUser,
} = require("./handlers/users");

// store routes
app.get("/stores", getAllStores);
app.post("/createStore", FBAuth, createOneStore);
app.get("/store/:storeId", getStore);
app.post("/store/:storeId/item", FBAuth, addItemToStore);
app.get("/stores/nearby", getNearbyStore);

// user routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadUserImage);
app.post("/user", FBAuth, addUserInfo);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);

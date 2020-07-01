const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const express = require("express");
const app = express();

app.get("/stores", (request, response) => {
  admin
    .firestore()
    .collection("stores")
    .get()
    .then((data) => {
      let stores = [];
      data.forEach((doc) => {
        stores.push({
					storeID: doc.id,
					storeData: doc.data()
				});
      });
      return response.json(stores);
    })
    .catch((err) => console.error(err));
});

app.get("/users", (request, response) => {
  admin
    .firestore()
    .collection("users")
    .get()
    .then((data) => {
      let users = [];
      data.forEach((doc) => {
        users.push({
					userID: doc.id,
					userData: doc.data()
				});
      });
      return response.json(users);
    })
    .catch((err) => console.error(err));
});

app.post("/createStore", (request, response) => {
  const newStore = {
		owner: request.body.owner,
		store_name: request.body.store_name,
    store_items: [],
  };
  admin
    .firestore()
    .collection("stores")
    .add(newStore)
    .then((doc) => {
      response.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      response.status(500).json({ error: "something went wrong!" });
      console.error(err);
    });
});

app.post("/createUser", (request, response) => {
  const newUser = {
    username: request.body.username,
    email: request.body.email,
    join_date: new Date().toISOString()
  };
  admin
    .firestore()
    .collection("users")
    .add(newUser)
    .then((doc) => {
      response.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      response.status(500).json({ error: "something went wrong!" });
      console.error(err);
    });
});

exports.api = functions.https.onRequest(app);

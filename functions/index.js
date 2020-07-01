const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

var firebaseConfig = {
  apiKey: "AIzaSyB37JG1mOP5y3PNDDCAGal1IEkqLoL44t8",
  authDomain: "comstore-ga.firebaseapp.com",
  databaseURL: "https://comstore-ga.firebaseio.com",
  projectId: "comstore-ga",
  storageBucket: "comstore-ga.appspot.com",
  messagingSenderId: "108556902424",
  appId: "1:108556902424:web:52bd72abd9e0acd3d4a36d",
};

const express = require("express");
const { request, response } = require("express");
const app = express();

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/stores", (request, response) => {
  db.collection("stores")
    .get()
    .then((data) => {
      let stores = [];
      data.forEach((doc) => {
        stores.push({
          storeID: doc.id,
          storeData: doc.data(),
        });
      });
      return response.json(stores);
    })
    .catch((err) => console.error(err));
});

app.get("/users", (request, response) => {
  db.collection("users")
    .get()
    .then((data) => {
      let users = [];
      data.forEach((doc) => {
        users.push({
          userID: doc.id,
          userData: doc.data(),
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
  db.collection("stores")
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
    join_date: new Date().toISOString(),
  };
  db.collection("users")
    .add(newUser)
    .then((doc) => {
      response.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      response.status(500).json({ error: "something went wrong!" });
      console.error(err);
    });
});

// signup route
app.post("/signup", (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    username: request.body.username,
  };

  // TODO validate data
  let token, userID;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return response
          .status(400).json({ username: "this username is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return db.doc(`/users/${newUser.username}`).set(userCredentials);
    })
    .then(() => {
      return response.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: "email is already in use" });
      } else {
        return response.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.https.onRequest(app);

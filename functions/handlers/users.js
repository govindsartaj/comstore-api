const { db } = require("../util/admin");
const { validateSignUpData, validateLoginData } = require('../util/validation')

const config = require("../util/config");
const firebase = require("firebase");
firebase.initializeApp(config);

exports.getAllUsers = (request, response) => {
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
};

exports.signup = (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    username: request.body.username,
  };

  const { valid, errors } = validateSignUpData(newUser);

  if(!valid){
      return response.status(400).json(errors)
  }

  // add user
  let token, userID;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return response
          .status(400)
          .json({ username: "this username is already taken" });
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
        userId,
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
};

// login
exports.login = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  // validation

  const { valid, errors } = validateLoginData(user);

  if(!valid){
      return response.status(400).json(errors)
  }


  // login with firebase
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return response.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        return response.status(403).json({ general: "Wrong email/password" });
      }
      return response.status(500).json({ error: err.code });
    });
};

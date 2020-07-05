const { db, admin } = require("../util/admin");
const {
  validateSignUpData,
  validateLoginData,
  reduceUserInfo,
} = require("../util/validation");

const config = require("../util/config");
const firebase = require("firebase");
const { request, response, json } = require("express");
firebase.initializeApp(config);

exports.signup = (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    username: request.body.username,
  };

  const { valid, errors } = validateSignUpData(newUser);

  if (!valid) {
    return response.status(400).json(errors);
  }

  const noImg = "no-img.png";

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
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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

  if (!valid) {
    return response.status(400).json(errors);
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

// add user info
exports.addUserInfo = (request, response) => {
  let userInfo = reduceUserInfo(request.body);

  db.doc(`/users/${request.user.username}`)
    .update(userInfo)
    .then(() => {
      return response.json({
        message: `User info for user ${request.user.username} updated successfully`,
      });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

// upload user profile image
exports.uploadUserImage = (request, response) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: request.headers });

  let imageFileName;
  let imageForUpload = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return response.status(400).json({ error: "Wrong file type" });
    }
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    imageFileName = `${Math.round(
      Math.random() * 100000000000000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageForUpload = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageForUpload.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageForUpload.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${request.user.username}`).update({ imageUrl });
      })
      .then(() => {
        return response.json({ message: "Image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({ error: err.code });
      });
  });
  busboy.end(request.rawBody);
};

// get own user info
exports.getAuthenticatedUser = (request, response) => {
  let userData = {};
  db.doc(`/users/${request.user.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection("stores")
          .where("owner", "==", request.user.username)
          .get();
      }
    })
    .then((data) => {
      userData.stores = [];
      data.forEach((doc) => {
        userData.stores.push(doc.data());
      });
      return response.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

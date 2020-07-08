const { db, admin, StoresGeoRef } = require("../util/admin");
const { response, request } = require("express");
const { validateItemData } = require("../util/validation");

exports.getNearbyStore = (request, response) => {
  const query = StoresGeoRef.near({
    center: new admin.firestore.GeoPoint(40.7589, -73.9851),
    radius: 1000,
  });
  query
    .get()
    .then((snap) => {
      const docs = snap.docs.map((doc) => {
        doc["data"] = doc["data"]();
        return doc;
      });
      response.send({ docs });
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: "something broke!" });
    });
};

exports.getAllStores = (request, response) => {
  db.collection("stores")
    .get()
    .then((data) => {
      let stores = [];
      data.forEach((doc) => {
        stores.push({
          storeId: doc.id,
          storeData: doc.data(),
        });
      });
      return response.json(stores);
    })
    .catch((err) => console.error(err));
};

exports.createOneStore = (request, response) => {
  const newStore = {
    owner: request.user.username,
    storeName: request.body.storeName,
    coordinates: new admin.firestore.GeoPoint(40.7589, -73.9851),
  };

  if (newStore.storeName.trim() === "") {
    return res.status(400).json({ storeName: "Cannot be empty" });
  }

  StoresGeoRef.add(newStore)
    .then((doc) => {
      db.doc(`/stores/${doc.id}`).update({ storeId: `${doc.id}` });
      response.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      response.status(500).json({ error: "something went wrong!" });
      console.error(err);
    });
};

exports.getStore = (request, response) => {
  let storeData = {};
  db.doc(`/stores/${request.params.storeId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Store does not exist" });
      }
      storeData = doc.data();
      storeData.storeId = doc.id;
      return db
        .collection("items")
        .where("storeId", "==", request.params.storeId)
        .get();
    })
    .then((data) => {
      storeData.items = [];
      data.forEach((doc) => {
        storeData.items.push(doc.data());
      });
      return response.json(storeData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.addItemToStore = (request, response) => {
  const { valid, errors } = validateItemData(request.body);

  if (!valid) {
    return response.status(400).json(errors);
  }

  let itemData = request.body;
  itemData.storeId = request.params.storeId;
  itemData.owner = request.user.username;
  itemData.createdAt = new Date().toISOString();

  db.collection("items")
    .add(itemData)
    .then((doc) => {
      response.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      response.error({ error: err.code });
    });
};

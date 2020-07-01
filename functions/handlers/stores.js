const { db } = require("../util/admin");

exports.getAllStores = (request, response) => {
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
};

exports.createOneStore = (request, response) => {
  const newStore = {
    owner: request.user.username,
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
};

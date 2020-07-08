const admin = require("firebase-admin");
admin.initializeApp();
var GeoFirestore = require("geofirestore").GeoFirestore;

const db = admin.firestore();

const geofirestore = new GeoFirestore(db);
const StoresGeoRef = geofirestore.collection("stores");

module.exports = { admin, db, geofirestore, StoresGeoRef };

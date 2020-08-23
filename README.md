ComStore API built using Node.js, Express.js and Firebase.
# Base URL
* [https://us-central1-comstore-ga.cloudfunctions.net](https://us-central1-comstore-ga.cloudfunctions.net)
# Endpoints
Note: Ask me (Govind) for info about request body info, or go thru code lol
## Users
* Sign Up : `POST /api/signup/`
* Log in : `POST /api/login/`
* Change user image (protected) : `POST /api/user/image`
* Change user info (protected) : `POST /api/user/`
* Get logged-in user info (protected) : `GET /api/user/`

## Stores
* Get all stores : `GET /api/stores`
* Create a store (protected) : `POST /api/createStore`
* Get store info : `GET /api/store/:storeId`
* Add item to store (protected) : `POST /api/store/:storeId/item`
* Get nearby stores : `POST /api/stores/nearby`


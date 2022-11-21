const express = require('express')
const { registerUser , authUser, allUsers} = require("../controllers/userControllers");
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// protect es el middleware que controla que el usuario que hace la consulta
// tenga el jwt correcto
router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);

module.exports = router;
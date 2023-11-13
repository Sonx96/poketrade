const express = require('express');
const router = express.Router();

const { isLoggedIn, isAdmin } = require("../middlewares/auth.middleware.js");
const User = require('../models/User.model');

// ejemplo de una ruta privada (solo usuarios logeados)
router.get("/", isLoggedIn, (req, res, next) => {

  console.log(req.session.user) // ! la informacion del usuario haciendo esta llamada
  console.log(req.session.user._id) // ! la id del usuario haciendo esta llamada

  // ! usan esta informacion para buscar en la BD cosas de este usuario
  User.findById(req.session.user._id)
  .then((response) => {
    console.log(response) // info del usuario para pasar al render
    res.render("profile/private.hbs" , { name: 1 })
  })
  .catch((err) => next(err))



})

// ++++++++++++++++++++++++++++++++++++++++++++++
// ruta solo para admin (escrito)
router.get("/admin", isLoggedIn, isAdmin, (req, res, next) => {

  res.render("profile/admin.hbs")

})



module.exports = router;
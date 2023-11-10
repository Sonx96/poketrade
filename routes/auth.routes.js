const express = require("express");
const User = require("../models/User.model");
const router = express.Router();
const bcrypt = require("bcryptjs");

// GET "/auth/signup" => renderizar formulario de registro
router.get("/signup", (req, res, next) => {
  res.render("auth/signup.hbs");
});

// POST "/auth/signup" => recibir los datos del usuario y crearlo en la DB
router.post("/signup", async (req, res, next) => {
  console.log(req.body);

  const { name, adress, dateOfBirth, telNum, country, email, password } =
    req.body;

  // los campos deban estar llenos
  if (
    name === "" ||
    adress === "" ||
    dateOfBirth === "" ||
    telNum === "" ||
    country === "" ||
    email === "" ||
    password === ""
  ) {
    console.log("Rellena todos los campos");
    // 1. queremos indicarle al usuario que hubo fallo de frontend
    res.render("auth/signup.hbs", {
      errorMessage: "Todos los campos deben estar llenos",
    });

    // 2. detener la ejecucion de la ruta/funcion
    return;
  }

  // la contraseña deba ser lo suficientemente segura
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  // const passwordRegex = new RegExp("/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm")
  if (passwordRegex.test(password) === false) {
    res.render("auth/signup.hbs", {
      errorMessage:
        "La contraseña no es lo suficientemente segura. Debe tener al menos 8 carácteres, al menos una mayúscula, una minúscula y un número.",
    });
    return; // detener la ruta
  }

  // el correo electronico deba tener el formato correcto

  try {
    // el correo electronico no este repetido
    const foundUserWithSameEmail = await User.findOne({ email });
    // si foundUserWithSameEmail es null, no hariamos nada
    // si foundUserWithSameEmail es algo, entonces enviamos error
    if (foundUserWithSameEmail !== null) {
      res.status(400).render("auth/signup.hbs", {
        errorMessage: "Correo electronico ya registrado",
      });
      return; // detener la ruta
    }

    // el nombre de usuario o correo electronico no este repetido

    // cifrar la contraseña del usuario
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // si todo sale bien, creamos al usuario

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // redireccion de prueba si todo sale bien
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

router.get("/login", (req, res, next) => {
  res.render("auth/login.hbs");
});

router.post("/login", async (req, res, next) => {
  console.log(req.body);
  const { email, password } = req.body;

  // validar que los campos esten llenos
  if (email === "" || password === "") {
    res.status(400).render("auth/login.hbs", {
      errorMessage: "Todos los campos deben estar llenos",
      email, // ejemplo de enviar los valores de campos antes de tener el error
      password, // ejemplo de enviar los valores de campos antes de tener el error
    });
    return; // esto detiene la ruta/funcion
  }

  try {
    // validar que el usuario exista
    const foundUser = await User.findOne({ email });
    if (foundUser === null) {
      res.status(400).render("auth/login.hbs", {
        errorMessage: "Usuario no registrado",
      });
      return; // esto detiene la ruta/funcion
    }

    // validar que la contraseña sea la correcto
    console.log(foundUser);
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    console.log("isPasswordValid", isPasswordValid);
    if (isPasswordValid === false) {
      res.status(400).render("auth/login.hbs", {
        errorMessage: "Contraseña no valida",
      });
      return; // esto detiene la ruta/funcion
    }

     // usuario validado/autenticado. Todo bien.
    // crear un sesion activa del usuario para que pueda navegar como activo en la pagina

    // en la sesion deberiamos agregar unicamente informacion del usuario que no cambia.
    const sessionInfo = {
      _id: foundUser._id, // ! el id del usuario
      email: foundUser.email,
    };

    //    esto nosotros le damos cualquier nombre
    //           |
    req.session.user = sessionInfo;
    // ! req.session es algo que vamos a tener acceso en CUALQUIER ruta de i servidor

    req.session.save(() => {
      // despues de registrar correctamente la sesion, que quieres hacer?

      // si todo sale bien
      res.redirect("/profile"); // ! alguna pagina privada
    });
  } catch (err) {
    next(err);
  }
});

// GET "/auth/logout" => cerrar la sesión activa del usuario y redireccionarlo a "/"
router.get("/logout", (req, res, next) => {

    req.session.destroy(() => {
      // despues de destruir la sesion, que quieres hacer?
      res.redirect("/")
    })
  
  })
  
module.exports = router;

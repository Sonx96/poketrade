const express = require("express");
const Card = require("../models/Card.model");
const Offer = require("../models/Offer.model")
const router = express.Router();
const User = require("../models/User.model")
const { isLoggedIn, isAdmin } = require("../middlewares/auth.middleware.js");
const uploader = require("../middlewares/cloudinary.middleware.js");

router.get("/", (req, res, next) => {
  res.render("auth/stock.hbs");
});

// POST "/auth/patata" => recibir los datos de las cartas y crealo en la DB
router.post("/", uploader.single("image"), async (req, res, next) => {
  console.log(req.body);

  const {name, description, rarity, noSeries, language, image } =
    req.body

  if (name === "" || description === "" || rarity === "" || noSeries === "" || language === "" || image === "" ) {
    console.log("Rellena todos los campos");

    res.render("auth/stock.hbs", {
      errorMessage: "Todos los campos deben estar llenos",
      name,
      description,
      rarity,
      noSeries,
      language,
      image,
    });
    return;
  } 

  try {
    const foundCardWithSameName = await Card.findOne({ name });
    if (foundCardWithSameName !== null) {
      res.status(400).render("auth/stock.hbs", {
        errorMessage: "Card already exist"
      });
      return;
    }

    await Card.create({
      name,
      description,
      rarity,
      noSeries,
      language,
      image: req.file.path
    });
    res.redirect("/"); 
  } catch (err) {
    next(err)
  }
})

// //GET "/"
// router.get("/patata2", (req, res, next) => {
//   Card.find()
//   .select({name: 1, description: 1})
//   .then((response ) => {
//     console.log(response)
//     res.render("index.hbs", {
//       allCards: response
//     })
//   })
//   .catch((err) => {
//     next(err)
//   })
// })

// GET "/card/:cardId/details"
// router.get("/:cardId/details", async (req, res, next) => {

//   try {

//     const response = await Card.findById(req.params.cardId).populate("user")
//     const offers = await Offer.find()
//     let offersArr = []
//     for (let index = 0; index < offers.length; index++) {
//       if(offers[index].card == req.params.cardId) {
//         offers[index].seller = await User.findById(offers[index].seller).select({name: 1, _id: 0})
//         offers[index].card = await Card.findById(offers[index].card).select({name:1, _id: 0})

//         offersArr.push(offers[index])
//       }
      
//     }
//     console.log(req.params.cardId)
//     console.log(response)

//     res.render("card.hbs", {
//       oneCard: response,
//       offersArr

//     })
//   } catch(err) {
//     next(err)
//   }
// })

router.get("/:cardId/details", async (req, res, next) => {
  try {
    const cardId = req.params.cardId;
    const card = await Card.findById(cardId).populate("user");
    const offers = await Offer.find({ card: cardId });
    const offersArr = await Promise.all(offers.map(async (offer) => {
      const seller = await User.findById(offer.seller).select({ name: 1, _id: 0 });
      const cardInfo = await Card.findById(offer.card).select({ name: 1, _id: 0 });
      return {
        ...offer.toObject(),
        seller,
        card: cardInfo
      };
    }));
    res.render("card.hbs", {
      oneCard: card,
      offersArr
    });
  } catch (err) {
    next(err);
  }
});

// router.post("/:cardId/delete", (req, res, next) => {

//   console.log("borrando card", req.params.cardId)
//   Card.findByIdAndDelete(req.params.cardId)
//   .then(() => {
//     res.redirect("/")
//   })
//   .catch((err) => {
//     next(err)
//   })
// })

router.post("/:cardId/delete", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    console.log(res)
      const cardId = req.params.cardId;
      
      await Card.findByIdAndDelete(cardId);
      
      res.redirect('/'); 
  } catch (error) {
      console.error(error);
      next(error);
  }
});

// POST "/:cardId/delete" => borrar una carta por su id
// router.post("/stock/:cardId/delete", (req, res, next) => {

//   console.log("borrando libro", req.params.cardId)
// })

router.get("/cart", isLoggedIn, async (req, res, next) => {
  try {
      const user = await User.findById(req.session.user._id);
      const allCards = await Card.find().select({ name: 1, description: 1, image: 1 });
      console.log(user); // Información del usuario
      res.render("cart.hbs", {
          userProfile: user,
          allCards: allCards
      });
  } catch (error) {
      console.error(error);
      next(error);
  }
});

module.exports = router;
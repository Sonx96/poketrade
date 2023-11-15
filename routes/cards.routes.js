const express = require("express");
const Card = require("../models/Card.model");
const Offer = require("../models/Offer.model")
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("auth/stock.hbs");
});

// POST "/auth/patata" => recibir los datos de las cartas y crealo en la DB
router.post("/", async (req, res, next) => {
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
      image,
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
router.get("/:cardId/details", async (req, res, next) => {

  try {

    const response = await Card.findById(req.params.cardId).populate("user")
    console.log(req.params.cardId)
    console.log(response)

    res.render("card.hbs", {
      oneCard: response
    })
  } catch(err) {
    next(err)
  }
})

// GET "/card/:cardId/details"
router.get("/:cardId/details", async (req, res, next) => {

  try {

    const response = await Card.findById(req.params.cardId).populate("user")
    console.log(req.params.cardId)
    console.log(response)

    res.render("card.hbs", {
      oneCard: response
    })
  } catch(err) {
    next(err)
  }
})

// GET "/card/:cardId/sell"
router.get("/:cardId/sell", async (req, res, next) => {

  try {
    const response = await Offer.findById(req.params.offerId).populate("user")
    console.log(req.params.offerId)
    console.log(response)

    res.render("auth/sell.hbs", {
      oneOffer: response
    })
  } catch(err) {
    next(err)
  }
})


module.exports = router;
const express = require("express")
const router = express.Router()

const jokeController = require("../controllers/jokeControllers")
const login = require("../Authentication/Authentication")

router.route("/").get(login.checkToken, jokeController.getAllJokes).post(login.checkToken, jokeController.createNewJoke)

router.route("/createUser").post(login.createUser)

router.route("/random").get(login.checkToken, jokeController.getRandomJoke)

router.route("/like/:id").get(login.checkToken, jokeController.addLikeById)

router.route("/login").post(login.login)

router.route("/delete/:id").get(login.checkToken,jokeController.deleteJoke)

router.route("/unlike/:id").get(login.checkToken, jokeController.unlikeJokeById)

module.exports = router

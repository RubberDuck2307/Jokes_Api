const Joke = require("../models/Joke")
const authentication = require("../Authentication/Authentication")
const User = require("../models/User")


exports.getAllJokes = async (req, res, next) => {
    try {
        let [jokes, _] = await Joke.findAll()
        res.status(200).json({jokes, success: true})
    } catch (error) {
        console.log(error)
        next(error)
    }

}

exports.unlikeJokeById = async (req, res, next) => {
    try{
        let joke = await Joke.unlikeById(req.params.id)
        await User.setUnlikedInDatabase(authentication.parseToken(req).id, req.params.id)
        res.status(200).json({success:true, joke: joke[0]})
    } catch (error){
        console.log(error)
        next(error)
    }


}

exports.addLikeById = async (req, res, next) => {
    try {
        let joke = await Joke.likeById(req.params.id)
        await User.addLikedJokeToDatabase(authentication.parseToken(req).id, req.params.id)
        res.status(200).json({success: true, joke: joke[0]})
    } catch (error) {
        console.log(error)
        next(error)
    }
}

exports.createNewJoke = async (req, res, next) => {
    try {
        let {title, text} = req.body
        let joke = new Joke(title, text)

        if (await Joke.checkTitle(joke.title)) {
            res.status(400).json({message: "Title has been already taken", success: false})
        } else {
            await joke.save()
            let jokeId = await Joke.getJokeID(title)
            let userId = await authentication.parseToken(req).id
            await User.addCreatedJoke(jokeId, userId);
            [joke, _] = await Joke.findById(await Joke.getJokeID(title))
            joke = JSON.parse(JSON.stringify(joke))
            res.status(201).json({message: "Joke created", success: true, joke:joke[0]})
        }
    } catch
        (error) {
        console.log(error)
        next(error)

    }


}

exports.getRandomJoke = async (req, res, next) => {
    try {
        let [jokesdatabase, _] = await Joke.findAll()
        let jokeID = Math.floor(Math.random() * (jokesdatabase.length - 1 + 1)) + 1;
        let [jokes, a] = await Joke.findById(jokeID)
        let joke = jokes[0]

        res.status(200).json({joke, success: true})
    } catch (error) {
        console.log(error)
        next(error)
    }
}

exports.getJokeById = async (req, res, next) => {
    try {
        let jokeId = req.params.id
        let [joke, _] = await Joke.findById(jokeId)

        res.status(200).json({joke, success: "true"})
    } catch (error) {
        console.log(error)
        next(error)
    }

}


exports.deleteJoke = async (req, res, next) => {
    try {
        let userId = await authentication.parseToken(req).id
        let userDatabase = "jokes" + userId
        let createdJokes = await User.getCreatedJokes(userDatabase)
        let inDatabase
        for (let i = 0; i < createdJokes.length; i++) {
            console.log(createdJokes[i].id)
            console.log(Number(req.params.id))
            if (createdJokes[i].id == Number(req.params.id)) {
                if (createdJokes[i].created) {
                    inDatabase = true
                    break
                }
            }
        }
        console.log(inDatabase)
        if (inDatabase) {

            await Joke.deleteJoke(req.params.id, userId)
            res.status(200).json({success: "true"})
        }
    } catch (e) {
        res.status(400)
        next(e)
    }

}

const bodyParser = require('body-parser')
const webToken = require('jsonwebtoken')
const express = require('express')
const bcrypt = require("bcrypt")
const User = require("../models/User")
const Joke = require("../models/Joke")
const saltRounds = 10

let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token) {
        webToken.verify(token, process.env.DB_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is not valid'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
};

let login = async (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let user = new User(username)
    let id = await user.getId()

    try {
        let [hash,_] = await user.getHash()
        hash = JSON.parse(JSON.stringify(hash[0]))
        if (username && password) {
            if (await bcrypt.compare(password,hash.password)) {
                let token = webToken.sign({id: id},
                    process.env.DB_KEY,
                    {
                        expiresIn: '24h' // expires in 24 hours
                    }

                );
                let relatedJokes = await User.getRelatedJokes(id)
                // return the JWT token for the future API calls
                res.status(200).json({
                    success: true,
                    message: 'Authentication successful!',
                    token: token,
                    relatedJokes: relatedJokes
                })
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Incorrect username or password'
                });
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'Authentication failed! Please check the request'
            });
        }

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Authentication failed! Please check the request'
        });
        next(error)
    }
}

let createUser = async (req, res, next) => {
    try {
        let username = req.body.username
        if(await User.checkUsername(username)){
            res.status(400).json({message: "The username has been already taken", success: false})
        }
        else {
            let hash = req.body.password
            hash = await bcrypt.hash(hash, saltRounds)
            let user = new User(username, hash)

            await user.saveUser()
            await user.createJokesDatabase()
            let token = webToken.sign({username: username},
                process.env.DB_KEY,
                {
                    expiresIn: '24h' // expires in 24 hours
                }
            )
            res.status(201).json({message: "User created", success: true, token: token})
        }
    } catch (error) {
        next(error)

    }


}

let parseToken = (req) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);}
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}

module.exports = {
    checkToken: checkToken,
    login: login,
    createUser: createUser,
    parseToken:parseToken
}
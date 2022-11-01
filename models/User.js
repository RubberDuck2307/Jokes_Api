const db = require("../config/db")
const e = require("express");
const Joke = require("./Joke");


class User{
    constructor(username, hash) {
        this.username = username
        this.hash = hash

    }

    async saveUser(){
        let sql = `INSERT INTO users(username, password)
        VALUES("${this.username}", "${this.hash}")`

        const newUser = await db.execute(sql)

        return newUser
    }

    getHash(){
        try {
            let sql = `SELECT password FROM users WHERE username = "${this.username}"`
            return db.execute(sql)
        }
        catch (error){
            return error
        }
    }

    async getId(){
        let sql = `SELECT id FROM users WHERE username = "${this.username}"`

        let [id,_] = await db.execute(sql)
        try {
            id = JSON.parse(JSON.stringify(id[0])).id
            
        }
        catch (e) {

        }
        return id
    }

    async createJokesDatabase(){
        try {
            let id = await this.getId()
            let databaseName = "jokes" + id
            let sql  = `CREATE TABLE ${databaseName}(
             id int,
             created boolean,
             liked boolean
             )
            `
            return db.execute(sql);
        }
        catch (error){
            return error
        }

    }

    static async addCreatedJoke(jokeId, userId){
        let userDatabase = "jokes" + userId
        const liked = false
        const created = true

        let sql = `INSERT INTO ${userDatabase}(id,liked,created)
                    VALUES(${jokeId}, ${liked}, ${created})`
        const newRecord = await db.execute(sql)

        return newRecord
    }

    static async getRelatedJokes(userId){
        let userDatabase =  "jokes" +userId
        let sql = `SELECT * FROM ${userDatabase}`
        let [relatedJokes,_] = await db.execute(sql)
        relatedJokes = JSON.parse((JSON.stringify(relatedJokes)))
        return relatedJokes
    }

    static async getUser(id){
       let sql = `SELECT * FROM users where id = ${id}`
        let [user,_] = await db.execute(sql)
        user = JSON.parse(JSON.stringify(user[0]))
        let username = user.username
        let hash = user.hash

        return new User(username, hash)
    }

    static async getCreatedJokes(userDatabase){
        let sql =`SELECT * FROM ${userDatabase} WHERE created = 1`
        let [jokes,_] = await db.execute(sql)
        jokes = JSON.parse(JSON.stringify(jokes))
        return jokes
    }

    static async getAllUsers(){
        let sql = `SELECT * FROM users`
        let [users,_] = await db.execute(sql)
        users = JSON.parse(JSON.stringify(users))
        return users
    }

    static async setUnlikedInDatabase(userId, jokeId){
        let userDatabase =  "jokes" +userId
        let sql = `UPDATE ${userDatabase} SET liked = 0 WHERE id = ${jokeId}`
        return db.execute(sql)
    }

    static async addLikedJokeToDatabase(userId, jokeId) {
        let jokes = this.getRelatedJokes(userId)
        let userDatabase =  "jokes" +userId
        let sql
        for (let i = 0; i < jokes.length; i++ ){
            if (jokes[i].id == jokeId){
                sql = `UPDATE ${userDatabase} SET liked = 1 WHERE id = ${jokeId}`
                return db.execute(sql)
            }
        }
        sql = `INSERT INTO ${userDatabase}(id,liked,created)
                    VALUES(${jokeId}, 1, 0)`
        return db.execute(sql)


    }

    static async checkUsername(username){
        let users = await User.getAllUsers()
        let equal = false
        for(let i = 0; i < users.length; i++){
            if(username == users[i].username){
                equal = true
                break
            }
        }
        return equal
    }
}

module.exports = User
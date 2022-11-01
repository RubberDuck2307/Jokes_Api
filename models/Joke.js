const db = require("../config/db")


class Joke {
    constructor(title, text) {
        this.title = title
        this.text = text
        this.likes = 0
    }

    static findAll() {
        let sql = `SELECT * FROM jokes `

        return db.execute(sql)
    }

    static findById(id) {
        let sql = `SELECT id, title, text, likes FROM jokes WHERE id = ${id}`

        return db.execute(sql)
    }

    static async likeById(id) {
        let sql = `UPDATE jokes SET likes = likes + 1 WHERE id = ${id}`
        await db.execute(sql)
        let [joke,_] = await this.findById(id)
        joke = JSON.parse(JSON.stringify(joke))
        return joke
    }

    async save() {
        let sql = `INSERT INTO jokes(title, text, likes)
        Values("${this.title}", "${this.text}", ${this.likes}
        )`
        const newJoke = await db.execute(sql)

        return newJoke
    }

    static async getJokeID(jokeTitle) {
        let sql = `SELECT id from jokes WHERE title = "${jokeTitle}"`
        let [id,_] = await db.execute(sql)
        id = JSON.parse(JSON.stringify(id[0])).id
        return id
    }

    static async deleteJoke(jokeId, userId){
        let userDatabase = "jokes" + userId
        let sql = `DELETE FROM jokes WHERE id = ${jokeId}`
        await db.execute(sql)
        sql = `DELETE FROM ${userDatabase}
        where id = ${jokeId}`
        await db.execute(sql)
    }

    static async checkTitle(title){
        let [jokes,_] = await Joke.findAll()
        let equal = false
        jokes = JSON.parse(JSON.stringify(jokes))
        for(let i = 0; i < jokes.length; i++){
            if(title == jokes[i].title){
                equal = true
            }
        }
        return equal
    }

    static async unlikeById(id){
        let sql = `UPDATE jokes SET likes = likes - 1 WHERE id = ${id}`
        await db.execute(sql);
        let [joke,_] = await this.findById(id)
        joke = JSON.parse(JSON.stringify(joke))
        return joke
    }

}

module.exports = Joke
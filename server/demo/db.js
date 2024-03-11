const { MongoClient } = require('mongodb')
const uri = 'mongodb+srv://riovo211:1234@cluster0.91k7zdk.mongodb.net/onlinestore'

let DBConnection
module.exports = {
    connectToDB: (cb) => {
        MongoClient.connect(uri)
            .then((client) => {
                DBConnection = client.db()
                return cb()
            })
            .catch(err => {
                console.log(err)
                return cb(err)
            })
    },
    getDB: () => DBConnection
}
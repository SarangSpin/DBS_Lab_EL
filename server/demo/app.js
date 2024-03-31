const express = require('express')
const { ObjectId } = require('mongodb')
const {connectToDB, getDB} = require('./db.js')
//init app and middleware

const app = express()
app.use(express.json())


//db connection
let db
connectToDB((err) => {
    if(!err){
        app.listen(3000, ()=> {
            console.log('listening on port 3000')
        })
        db = getDB()
    }
    else{
        console.log(err)
    }
})

//routes
app.get('/reviews', (req, res)=> {
    let reviews = []
    db.collection('reviews')
        .find()//returns cursor, use toArray forEach
        .sort({rating:1})
        .forEach(review =>{
            reviews.push(review)
        })
        .then(()=>{
            res.status(200).json(reviews)
        })
        .catch(()=>{
            res.status(500).json({error: 'Could not fetch the documents'})
        })
} )

app.get('/reviews/product/:prodid', (req, res)=> {
    let reviews = []
    db.collection('reviews')
        .find({product_id : req.params.prodid})
        .sort({rating:1})
        .forEach(review =>{
            reviews.push(review)
        })
        .then(()=>{
            res.status(200).json(reviews)
        })
        .catch(()=>{
            res.status(500).json({error: 'Could not fetch the document'})
        })
} )

app.get('/reviews/id/:id', (req, res)=> {
    db.collection('reviews')
        .findOne({_id : new ObjectId(req.params.id)})
        .then(doc=>{
            res.status(200).json(doc)
        })
        .catch(()=>{
            res.status(500).json({error: 'Could not fetch the document'})
        })
} )

app.post('/reviews', (req, res) => {
    const review = req.body
  
    db.collection('reviews')
      .insertOne(review)
      .then(result => {
        res.status(201).json(result)
      })
      .catch(err => {
        res.status(500).json({err: 'Could not create new document'})
      })
  })

  app.delete('/reviews/deleteid/:id', (req, res) => {

    if (ObjectId.isValid(req.params.id)) {
  
    db.collection('reviews')
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then(result => {
        res.status(200).json(result)
      })
      .catch(err => {
        res.status(500).json({error: 'Could not delete document'})
      })
  
    } else {
      res.status(500).json({error: 'Could not delete document'})
    }
  })
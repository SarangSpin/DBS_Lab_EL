const express = require("express");
const cors = require("cors");
const mysql = require('mysql')
const flash = require('connect-flash')
const { stringify } = require("querystring");
const multer = require("multer");
const env = require('dotenv').config().parsed;
const fs = require('fs')
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const mongodb = require('mongodb')
const primary = require('./assets/sql/primary')
const {connectToDB, getDB} = require('./db.js')
const { ObjectId } = require('mongodb')


const con = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: `${process.env.SQL_PASS}`
  });


  
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

con.on('error', function(err) {
    console.log("[mysql error]",err);
  });



  

  let db
  let reviews = []

connectToDB((err) => {
  if(!err){
    db = getDB()
    
    db.collection('reviews')
        .find()//returns cursor, use toArray forEach
        .sort({rating:1})
        .forEach(review =>{
            reviews.push(review)
        })
        .then(()=>{
            // res.status(200).json(reviews)
            //console.log(reviews)
        })
        .catch(()=>{
            //res.status(500).json({error: 'Could not fetch the documents'})
            console.log(err)
        })

    
  }
})



// mongodb.MongoClient.connect("mongodb+srv://riovo211:1234@cluster0.91k7zdk.mongodb.net/")
// .then((client)=> {
//     console.log(client.db().collection('review'))
//     console.log(42)
//     console.log(client.db)
    
//     db = client.db()
//     console.log(db.collection('reviews').sort().forEach(review=>reviews.push(review)).then(()=>console.log(reviews)).catch((err)=>console.log(err)))
// })
// .catch((err)=> console.log(err))

//console.log(db.collection('reviews').find())
const app = express();

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(helmet.xssFilter());

app.use(flash())

app.listen(8080, (req, res)=>{
  console.log("Server running")
})

app.use(cors(
    {
        origin: ['http://localhost:5173'],  
        credentials: true
    }
))

app.use(cookieParser())
app.use(express.static('assets'))

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


const verifyToken = (req, res, next)=>{
    let token = req.cookies.token;
    if(!token){
        res.json("Authentication required")
    }
    else{
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded)=>{
            if(err) res.json("Incorrect token")
            else next();
        } )
    }
}

app.get('/',  (req, res) => {

    console.log(req.body);
    console.log(req.query)
    
    const q = primary.home(req.query);

    con.query(q, (err, data)=>{

        if(err) 
        {
            console.log(err)
            res.json(`Error loading products`)
        }
        console.log(data)
        
        res.json(data);
        
    })
    
   
  });
  
  app.get('/shop', verifyToken, (req, res) => {
   
    res.send('Shop'); 
  });
  
  app.get('/shop/product',  (req, res) => {
   
    const q = primary.singleProduct(req.query);

    con.query(q, (err, data)=>{

        if(err) 
        {
            console.log(err)
            res.json(`Error loading product`)
        }
        console.log(data)

        let token = req.cookies.token;
    if(!token){
        console.log(117)
        res.json({data: data[0], user_id: 'null', cart_id: 'null'})
    }
    else{
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded)=>{
            if(err) res.json('undefined')

           
            const q = primary.getCart(decoded);
            con.query(q, (err, data2)=>{

                if(err) 
                {
                    console.log(decoded)
                    console.log(err)
                    console.log(130)
                  //  res.json({data: data[0], user_id: decoded.customer_id, cart_id: 'null' })
                }
                console.log(data)
                console.log(135)
                res.json({data: data[0], user_id: decoded.customer_id, cart_id: data2[0].cart_id });
                
            })


            
        } )
        
    }
        
        
    })
    

    
  });

  app.post('/createCart', (req, res)=>{
    const q = primary.createCart(req.query.customer_id)
    con.query(q, (err, data)=>{

        if(err) 
        {
            console.log(err)
            res.json(`Error creating cart`)
        }
        console.log(data)
        
        res.json(data);
        
    }) 

  })
  
  app.get('/about', (req, res) => {
    // Render the About component
    res.send('About'); 
  });
  

  app.post('/register', (req, res) => {
    console.log(req.body);
    const q = primary.checkSignup(req.body);
    con.query(q, (err, data)=>{

        console.log(181)
        console.log(data)
        if(err) {
            console.log(err)
            res.json(`error checking user - ${err.stack}`);
        }
        console.log(data)
        if(data.length > 0)
        {
            res.json('User email already in use!');
        }

        const hashedPassword = bcrypt.hashSync(req.body.password, 10, (err)=>{if (err) next(err)});

        const p = primary.register({email: req.body.email, name: req.body.name, password: hashedPassword, phone_number: req.body.phone_number, customer_id: req.body.id});

        con.query(p, (err, data)=>{
            console.log(199)
            console.log(data)
            if(err) {
                console.log(err)
                res.json(`error inserting user - ${err.stack}`);
            }

             console.log(data)

            const x = primary.createCart(req.body.id);

            con.query(x, (err, data)=>{

                if(err) 
                {
                    console.log(err)
                    res.json(`Error`)
                }
                console.log(data)
                
                res.json('Registered Successfully');
                
            })


            
    
        })

    })
  });


  app.post('/login', (req, res) => {
  

    const q = primary.login(req.body);
    con.query(q, (err, data)=>{


        if(err) {
            console.log(err)
            res.json(`invalid - ${err.stack}`);
        }

        else{
        console.log(data)
        console.log(243)
        bcrypt.compare(req.body.password, data[0].password, (err, result)=>{
            console.log(result);

            if(err)
            {
                console.log(err)
                res.json(`invalid - ${err.stack}`);
            }

            else if(result){

                let token = jwt.sign({email: req.body.email, customer_id: data[0].customer_id}, process.env.SECRET_KEY, {expiresIn: "5d"});
                res.cookie("token", token);
                res.json(true);
            }
            else{
                res.json(false);
            }
        
        })
    }
        

    })
    
  });

  app.get('/loggedIn', (req, res) => {

     const token = req.cookies.token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded)=>{
        if(err) res.json("Incorrect token")
        console.log(decoded)
        res.json('Already logged in');
    } )
});



app.post('/addToCart', (req, res)=>{

    const q = primary.addToCart(req.body);

    con.query(q, (err, data)=>{

        if(err) 
        {
            console.log(err)
            res.json(`Error adding to cart`)
        }
        console.log(data)
        res.json(data)
        
    })

    
})

app.get('/getCart', verifyToken, (req, res)=>{

    const q = primary.cart(req.query.cart_id)
    con.query(q, (err, data)=>{

        if(err) 
        {
            console.log(err)
            res.json(`Error adding to cart`)
        }
        console.log(data)
        res.json(data)
        
    })


})

app.get('/deleteCart',  (req, res) => {

    const q = primary.deleteCart(req.query);

    con.query(q, (err, data)=>{

        if(err) 
        {
            console.log(err)
            res.json(`Error deleting cart`)
        }
        console.log(data)
        
        
        res.json(data);
        
    })
    
   
  });

  app.get('/reviews', (req, res)=>{

    let result = []

    db.collection('reviews')
        .find({product_id: req.query.pid})//returns cursor, use toArray forEach
        .forEach(review =>{
            result.push(review)
        })
        .then(()=>{
            // res.status(200).json(reviews)
            console.log(404)
            console.log(result)
        }).catch(err=>console.log(err))

    res.json(result)
  })

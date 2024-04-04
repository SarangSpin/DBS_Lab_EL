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
})

    app.get('/search',  (req, res) => {

        console.log(req.body);
        console.log(req.query)
        
        const q = primary.searchResults(req.query);
    
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

                db.collection('views').updateOne({product_id: req.query.pid}, {$inc: {views: 1}}).then((x)=>console.log(x)).catch(err=>console.log(err))
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

app.get('/logout', (req,res)=>{
    res.clearCookie("token");
    res.json(true)
})



app.post('/addToCart', (req, res)=>{

    const q = primary.addToCart(req.body);
    db.collection('sales').updateOne({product_id: req.body.product_id}, {$inc: {sales_count: 1}}).then((x)=>console.log(x)).catch(err=>console.log(err))

    con.query(q, (err, data)=>{

        if(err) 
        {
            console.log(err)
            res.json(`Error adding to cart`)
        }
        console.log(data)
        const q = primary.updateCart(req.body);

        con.query(q, (err, data)=>{
    
            if(err) 
            {
                console.log(err)
                res.json(`Error adding  cart`)
            }

            console.log(data)
            res.json(data)
            
        })


        // console.log(data)
        // res.json(data)
        
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
        
        const q = primary.emptyCart(req.query);

    con.query(q, (err, data)=>{

        if(err) 
        {
            console.log(err)
            res.json(`Error deleting cart`)
        }
        console.log(data)
        
        
        res.json(data);
        
    })
        
        
        
    })
    
   
  });

  app.get('/reviews', (req, res)=>{

    let result = []
    console.log(req.query)

    db.collection('reviews')
        .find({product_id: req.query.pid})//returns cursor, use toArray forEach
        .sort()
        .forEach((x) =>{
            console.log(x)
            result.push(x)
        })
        .then(()=>{
            // res.status(200).json(reviews)
            console.log(404)
            console.log(result)
            res.json(result)
        }).catch(err=>console.log(err))
    // result = reviews.filter((x)=>{
    //     console.log(x);
    //     return x.product_id==req.query.pid;
    // })

    
    
  })

  app.get('/createSales', (req, res)=>{
    const products = [
        { product_id: "PRD001", product_name: "iPhone 14 Pro Max", sales_count: 0 },
        { product_id: "PRD002", product_name: "Galaxy S23 Ultra", sales_count: 0 },
        { product_id: "PRD003", product_name: "Pixel 7 Pro", sales_count: 0 },
        { product_id: "PRD004", product_name: "Galaxy Z Fold 4", sales_count: 0 },
        { product_id: "PRD005", product_name: "OnePlus 11 Pro", sales_count: 0 },
        { product_id: "PRD006", product_name: "Redmi Note 12 Pro+", sales_count: 0 },
        { product_id: "PRD007", product_name: "MacBook Pro 14\"", sales_count: 0 },
        { product_id: "PRD008", product_name: "Galaxy Book 2 Pro 360", sales_count: 0 },
        { product_id: "PRD009", product_name: "XPS 13 Plus", sales_count: 0 },
        { product_id: "PRD010", product_name: "VAIO Z", sales_count: 0 },
        { product_id: "PRD011", product_name: "Surface Laptop Studio", sales_count: 0 },
        { product_id: "PRD012", product_name: "IdeaPad Flex 5i", sales_count: 0 },
        { product_id: "PRD013", product_name: "iPad Air (5th Gen)", sales_count: 0 },
        { product_id: "PRD014", product_name: "Galaxy Tab S8 Ultra", sales_count: 0 },
        { product_id: "PRD015", product_name: "Surface Pro 8", sales_count: 0 },
        { product_id: "PRD016", product_name: "Fire HD 10", sales_count: 0 },
        { product_id: "PRD017", product_name: "LG OLED C2 65\"", sales_count: 0 },
        { product_id: "PRD018", product_name: "Sony XBR X90K 55\"", sales_count: 0 },
        { product_id: "PRD019", product_name: "Samsung QN90B 65\"", sales_count: 0 },
        { product_id: "PRD020", product_name: "TCL 55S535", sales_count: 0 },
        { product_id: "PRD021", product_name: "Apple AirPods Max", sales_count: 0 },
        { product_id: "PRD022", product_name: "Sony WH-1000XM5", sales_count: 0 },
        { product_id: "PRD023", product_name: "Bose QuietComfort 45", sales_count: 0 },
        { product_id: "PRD024", product_name: "Sennheiser Momentum 3 Wireless", sales_count: 0 },
        { product_id: "PRD025", product_name: "Sonos One (Gen 2)", sales_count: 0 },
        { product_id: "PRD026", product_name: "LG XBOOM Go PL7", sales_count: 0 },
        { product_id: "PRD027", product_name: "Ultimate Ears MEGABOOM 3", sales_count: 0 },
        { product_id: "PRD028", product_name: "JBL Flip 6", sales_count:0},

    ]

    const validationSchema = {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["product_id", "product_name"],
            properties: {
              _id: { bsonType: "objectId" },
              product_id: { bsonType: "string" },
              product_name: { bsonType: "string" },
              sales_count: { bsonType: "int", minimum: 0 }
            }
          }
        }
      };
       
       db.createCollection('sales', validationSchema).then((res)=>{
        console.log(res)
        collection = db.collection('sales')
        collection.insertMany(products)
       });
       
  
      console.log("Sales collection created and populated successfully!");
  
  
  })


  app.post('/addReview', (req, res)=>{
    db.collection('reviews').insertOne({product_id: req.body.product_id, customer_id: req.body.customer_id, review: req.body.review, rating: req.body.rating})
    .then(()=>{console.log(425); res.json(true)})
    .catch((err)=>{console.log(426); console.log(err); res.json('Error adding review')}) 
})

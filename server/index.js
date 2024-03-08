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

const primary = require('./assets/sql/primary')

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
            next();
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
        
        res.json(data[0]);
        
    })
    

    
  });
  
  app.get('/about', (req, res) => {
    // Render the About component
    res.send('About'); 
  });
  

  app.post('/register', (req, res) => {
    console.log(req.body);
    const q = primary.checkSignup(req.body);
    con.query(q, (err, data)=>{

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

            if(err) {
                console.log(err)
                res.json(`error inserting user - ${err.stack}`);
            }

             console.log(data)

            const x = primary.createCart(data.customer_id);

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

        bcrypt.compare(req.body.password, data[0].password, (err, result)=>{
            console.log(result);

            if(err)
            {
                console.log(err)
                res.json(`invalid - ${err.stack}`);
            }

            else if(result){

                let token = jwt.sign({email: req.body.email, customer_id: req.body.customer_id}, process.env.SECRET_KEY, {expiresIn: "5d"});
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

app.get('getCart', (req, res)=>{

    const q = primary.getCart(req.body);

})

app.post('/addToCart', (req, res)=>{

    const p = primary.getCart(req.body);

    con.query(q, (err, data)=>{

        if(err) 
        {
            console.log(err)
            res.json(`Error getting cart info`)
        }
        console.log(data)
        
        const q = primary.addToCart({cart_id: data.cart_id, quantity: req.body.quantity, product_id: req.product_id});

        con.query(q, (err, data)=>{

            if(err) 
            {
                console.log(err)
                res.json(`Error adding product`)
            }
            console.log(data)
            
            res.json('Added Successfully');
        
            })
        
    })

    
})
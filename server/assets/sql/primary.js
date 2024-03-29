
const { v4: uuidv4 } = require('uuid');
 
 const primary = {
    landing: (params)=>{
        
    },
    login: (params)=>{
        return `SELECT email , password FROM \`e-commerce\`.customer WHERE email = '${params.email}'`
    },
    register: (params)=>{
        return `INSERT INTO \`e-commerce\`.customer (customer_id, name, phone_no, date_created, email, password) VALUES ('${params.customer_id}', '${params.name}', '${params.phone_number}', curdate(), '${params.email}', '${params.password}')`
    },
    checkSignup: (params)=>{
        return `SELECT customer_id FROM \`e-commerce\`.customer WHERE email = '${params.email}'`
    },
    singleProduct: (params)=>{
        return `SELECT * FROM \`e-commerce\`.products WHERE product_id = '${params.pid}'`
    },
    home: (params)=>{

        if(params.n == 1 || params.n == 3)
        return `SELECT * FROM \`e-commerce\`.products ORDER BY prod_name ASC LIMIT 10 `
    else return `SELECT * FROM \`e-commerce\`.products ORDER BY prod_name DESC LIMIT 10 `
    },
    getCart: (params)=>{

        return `SELECT cart_id  FROM \`e-commerce\`.cart WHERE customer_id = ${params.customer_id}`
    },
    addToCart: (params)=>{
        return `INSERT INTO \`e-commerce\`.cart_item (item_id, cart_id, quantity, date_added, product_id) VALUES ('${params.product_id}', '${params.cart_id}', ${params.quantity}, curdate(),  '${params.product_id}')`
    },
    createCart: (params)=>{
        return `INSERT INTO \`e-commerce\`.cart (cart_id, cart_quantity, customer_id) VALUES ('${uuidv4()}', 0, '${params}')`
    }
    
}

module.exports =  primary;



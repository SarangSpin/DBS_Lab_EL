
const { v4: uuidv4 } = require('uuid');
 
 const primary = {
    landing: (params)=>{
        
    },
    login: (params)=>{
        return `SELECT email , customer_id,  password FROM \`e-commerce\`.customer WHERE email = '${params.email}'`
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

        return `SELECT cart_id  FROM \`e-commerce\`.cart WHERE customer_id = '${params.customer_id}'`
    },
    addToCart: (params)=>{
        return `
        INSERT INTO \`e-commerce\`.cart_item (item_id, cart_id, quantity, date_added, product_id, prod_name)
        VALUES ('${params.product_id}', '${params.cart_id}', 1, CURDATE(),  '${params.product_id}', '${params.prod_name}')
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);

        `
        //return `INSERT INTO \`e-commerce\`.cart_item (item_id, cart_id, quantity, date_added, product_id, prod_name) VALUES ('${params.product_id}', '${params.cart_id}', 1, curdate(),  '${params.product_id}', '${params.prod_name}')`
    },
    updateCart: (params)=>{
        return `         
        UPDATE \`e-commerce\`.cart
        SET cart_quantity = cart_quantity + 1
        WHERE cart_id = '${params.cart_id}'`
    },
    createCart: (params)=>{
        return `INSERT INTO \`e-commerce\`.cart (cart_id, cart_quantity, customer_id) VALUES ('${uuidv4()}', 0, '${params}')`
    },
    cart: (params)=>{
        return `SELECT * FROM \`e-commerce\`.cart_item WHERE cart_id='${params}'`
    },
    deleteCart: (params)=>{
        return `DELETE FROM \`e-commerce\`.cart_item WHERE cart_id='${params.cart_id}'`
    },
    emptyCart: (params)=>{
        return `         
        UPDATE \`e-commerce\`.cart
        SET cart_quantity = 0
        WHERE cart_id = '${params.cart_id}'`
    }
    
}

module.exports =  primary;



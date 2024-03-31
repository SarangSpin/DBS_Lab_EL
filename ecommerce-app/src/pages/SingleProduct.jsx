import axios from "axios";
import React, { useState, useEffect } from "react";
//import { URLSearchParams } from "url";
import { toast } from "react-toastify";
import Axios from "axios";
import { SectionTitle } from "../components";
import { useNavigate } from "react-router-dom";
const SingleProduct = () => {
  
  //to create user state object to store user customer id, used for fetching cart details and adding product to cart

  const queryParams = new URLSearchParams(location.search);
  console.log(queryParams)
 const [newReview, setNewReview] = useState('')
 const [rating, setRating] = useState(0)
 const [product, setProduct] = useState({})
 const [cart_id, setCartId] = useState(null)
 const [customer_id, setCustomerId] = useState('')
 const [reviews, setReview] = useState([])
 

 useEffect(()=>{

  displayProduct()
  setReviews()
    
  }, [])

  const setReviews = async()=>{
    Axios({
      method: 'GET',
      url: `http://localhost:8080/reviews?pid=${queryParams.get('pid')}&customer_id=${customer_id}`,
      withCredentials: true,
  }).then((res)=>{
  
    if(res.data != 'Error fetching reviews')
    {
      console.log(res.data)
      setReview(res.data)
      

    }
    else{
      toast.error(res.data)
    }
  
    
  }).catch(err=>{
    toast.error('Error fetching reviews');
  })
  }

  const displayProduct = async() => {

    Axios({
      method: 'GET',
      url: `http://localhost:8080/shop/product/?pid=${queryParams.get('pid')}`,
      withCredentials: true,
  }).then((res)=>{
  
    if(res.data != 'Error loading product')
    {
      console.log(res.data)
      setProduct(res.data.data);
      setCartId(res.data.cart_id);
      setCustomerId(res.data.user_id)

      
     // displayProducts()
      
    }
    else{
      toast.error(res.data)
    }
  
    
  }).catch(err=>{
    toast.error('Error loading product');
  })

    
  }

  const navigate = useNavigate();

  const addReview = () => {
   
   Axios({
      method: 'POST',
      url: `http://localhost:8080/addReview`,
      withCredentials: true,
      data: {product_id: product.product_id, rating: rating, review: newReview, customer_id:customer_id}
  }).then((res)=>{
  
    if(res.data == true)
    {
      console.log(97)
      console.log(res.data)
     toast.success('Added Review')
     
     
    }
    else{
      console.log(104)
      console.log(res.data)
      toast.error(res.data)
    }
  
    
  }).catch(err=>{
    toast.error('Error adding review');
  })


  }

  const addToCart = ()=>{

     console.log(customer_id)
     console.log(cart_id)
     console.log(product)
    if(customer_id == '' || customer_id == 'null' || customer_id == 'undefined') navigate('/login')

    if(cart_id ==  'null')
    {
      Axios({
        method: 'GET',
        url: `http://localhost:8080/createCart?customer_id=${customer_id}`,
        withCredentials: true
    }).then((res)=>{
    
      if(res.data != 'Error creating cart')
      {
        console.log(res.data)
       toast.success('Created cart')
       setCartId(res.data.cart_id)
       
      }
      else{
        toast.error(res.data)
      }
    
      
    }).catch(err=>{
      toast.error('Error creating cart');
    })

    Axios({
      method: 'POST',
      url: `http://localhost:8080/addToCart`,
      withCredentials: true,
      data: {cart_id: cart_id, product: product.product_id}
  }).then((res)=>{
  
    if(res.data != 'Error adding to cart')
    {
      console.log(res.data)
     toast.success('Added to cart')
     navigate(`/cart?cart_id=${cart_id}`)
     
      
    }
    else{
      toast.error(res.data)
    }
  
    
  }).catch(err=>{
    toast.error('Error adding to cart');
  })

    }
else{
    Axios({
      method: 'POST',
      url: `http://localhost:8080/addToCart`,
      withCredentials: true,
      data: {cart_id: cart_id, product_id: product.product_id, prod_name: product.prod_name}
  }).then((res)=>{
  
    if(res.data != 'Error adding to cart')
    {
      console.log(res.data)
     toast.success('Added to cart')
     navigate(`/cart?cart_id=${cart_id}`)
     
      
    }
    else{
      toast.error(res.data)
    }
  
    
  }).catch(err=>{
    toast.error('Error adding to cart');
  })

}
    

  }






  return (
    <>
      <SectionTitle title="Product page" path="Home | Shop | Product page" />
      <div className="grid grid-cols-2 max-w-7xl mx-auto mt-5 max-lg:grid-cols-1 max-lg:mx-5">
        <div className="product-images flex flex-col justify-center max-lg:justify-start">
          <img
            src={`http://localhost:8080/images/${product?.prod_type}.jpg`}
            className="w-96 text-center border border-gray-600 cursor-pointer"
            alt={product?.prod_name}
          />
        </div>
        <div className="single-product-content flex flex-col gap-y-5 max-lg:mt-2">
          <h2 className="text-5xl max-sm:text-3xl text-accent-content">
            {product?.prod_name}
          </h2>
          <p className="text-3xl">
            {product?.color}
          </p>
          <p className="text-3xl text-error">
            ${product?.cost}
          </p>
          <div className="text-xl max-sm:text-lg text-accent-content">
            Ratings - {product?.ratings}/5
          </div>

          </div>
          <div className="flex flex-row gap-x-2 max-sm:flex-col max-sm:gap-x">
            
            <button
              className="btn bg-blue-600 hover:bg-blue-500 text-white"
              onClick={() => {
               addToCart();
              }}
            >
              Add to cart
            </button>

           
          </div>
          <div className="other-product-info flex flex-col gap-x-2">
  
            <div className="badge bg-gray-700 badge-lg font-bold text-white p-5 mt-2">
              Category: {product?.prod_type}
            </div>
            <div className="badge bg-gray-700 badge-lg font-bold text-white p-5 mt-2">
              Add Review:
              <input type="text" onChange={e=>setNewReview(e.target.value)} />
              Rating:
              <input type="number" max={10} min={1} onChange={e=>setRating(e.target.value)} />
            <br />
            
            </div>
            <input type="submit" onClick={addReview} />
            <div>
            

              <div className="badge bg-gray-700 badge-lg font-bold text-white p-5 mt-2">Reviews:</div>
            {reviews.map((review)=>{
              return <div className="text-xl max-sm:text-lg text-accent-content">
                <br />
                <div>{review.rating}/10 - {review.customer_id}</div>
                <div>{review.review}</div>
                <br />
                <br />
                <br />
              </div>
            })}
          </div>
          
          </div>
          
        </div>
      

    </>
  );
};

export default SingleProduct;

import axios from "axios";
import React, { useState, useEffect } from "react";
import { URLSearchParams } from "url";
import { toast } from "react-toastify";
import Axios from "axios";

const SingleProduct = () => {
  
  //to create user state object to store user customer id, used for fetching cart details and adding product to cart

  const queryParams = new URLSearchParams(location.search);
 const [product, setProduct] = useState({})

 useEffect(()=>{

  displayProduct()
    
  }, [])

  const displayProduct = async() => {

    Axios({
      method: 'GET',
      url: `http://localhost:8080/shop/product/?pid=${queryParams.get('pid')}`,
      withCredentials: true,
  }).then((res)=>{
  
    if(res.data != 'Error loading product')
    {
      console.log(res.data)
      setProduct(res.data);

      
     // displayProducts()
      
    }
    else{
      toast.error(res.data)
    }
  
    
  }).catch(err=>{
    toast.error('Error loading product');
  })

    
  }






  return (
    <>
      <SectionTitle title="Product page" path="Home | Shop | Product page" />
      <div className="grid grid-cols-2 max-w-7xl mx-auto mt-5 max-lg:grid-cols-1 max-lg:mx-5">
        <div className="product-images flex flex-col justify-center max-lg:justify-start">
          <img
            src={`http://localhost:8080/assets/images/${product?.prod_type}.jpg`}
            className="w-96 text-center border border-gray-600 cursor-pointer"
            alt={product?.name}
          />
        </div>
        <div className="single-product-content flex flex-col gap-y-5 max-lg:mt-2">
          <h2 className="text-5xl max-sm:text-3xl text-accent-content">
            {product?.name}
          </h2>
          <p className="text-3xl text-error">
            ${product?.color}
          </p>
          <p className="text-3xl text-error">
            ${product?.cost}
          </p>
          <div className="text-xl max-sm:text-lg text-accent-content">
            {product?.ratings}
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
          </div>
        </div>
      

    </>
  );
};

export default SingleProduct;

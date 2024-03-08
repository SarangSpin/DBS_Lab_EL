import React, { useEffect, useState } from "react";
import "../styles/Landing.css";
import { Hero, ProductElement, Stats } from "../components";
import { useLoaderData, useNavigate } from "react-router-dom";
import Axios from "axios";
import { toast } from "react-toastify";

// export const landingLoader = async () => {
//   const response = await axios(
//     `http://localhost:8080/home_products?_page=1&_limit=8`
//   );
//   const data = response.data;

//   return { products: data };
// };



const Landing = () => {

  const [products, setProducts] = useState([])

useEffect(()=>{

//   Axios({
//     method: 'GET',
//     url: `http://localhost:8080/?n=${Math.floor(Math.random() * 3) + 1}`,
//     withCredentials: true,
// }).then((res)=>{

//   if(res.data != 'Error loading products')
//   {
//     console.log(res.data)
//     setProducts(res.data);

//    // displayProducts()
    
//   }
//   else{
//     toast.error(res.data)
//   }

  
// }).catch(err=>{
//   toast.error('Error loading products');
// })
displayProducts()
  
}, [])
  // const { products } = useLoaderData();
  const navigate = useNavigate();

  const displayProducts = async() => {

    Axios({
      method: 'GET',
      url: `http://localhost:8080/?n=${Math.floor(Math.random() * 3) + 1}`,
      withCredentials: true,
  }).then((res)=>{
  
    if(res.data != 'Error loading products')
    {
      console.log(res.data)
      setProducts(res.data);

      
     // displayProducts()
      
    }
    else{
      toast.error(res.data)
    }
  
    
  }).catch(err=>{
    toast.error('Error loading products');
  })

    
  }

  return (
    <main>
      <div className="selected-products">
        <h2 className="text-6xl text-center my-12 max-md:text-4xl text-accent-content">
          Trending Products
        </h2>
        <div className="selected-products-grid max-w-7xl mx-auto">
           {/* {products == [] ? 'Loading' : products.map((product) => (
            <ProductElement
              key={product.id}
              id={product.id}
              title={product.prod_name}
              image={`http://localhost:8080/assets/images/${product.prod_type}.jpg`}
              price={product.cost}
          ))}  */}
          {products.map((product)=>{
     return <ProductElement
      key={product.id}
      id={product.id}
      title={product.prod_name}
      image={`http://localhost:8080/images/${product.prod_type}.jpg`}
      price={product.cost}
    />
    })}
        </div>
      </div>
    </main>
  );
};

export default Landing;

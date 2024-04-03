import React, { useEffect, useState } from "react";
import "../styles/Landing.css";
import { Hero, ProductElement, Stats } from "../components";
import { useLoaderData, useNavigate } from "react-router-dom";
import Axios from "axios";
import { toast } from "react-toastify";




const Search_Products = () => {

  
  const [searchResults, setSearchResults] = useState([])
  const [search, setSearch] = useState('')

  // useEffect({}, [])

  // const { products } = useLoaderData();
  //const navigate = useNavigate();

  const displayProducts = async() => {

    Axios({
      method: 'GET',
      url: `http://localhost:8080/search?prod_name=${search.toLowerCase()}`,
      withCredentials: true,
  }).then((res)=>{
  
    if(res.data != 'Error loading products')
    {
      console.log(res.data)
      if(res.data.length == 0){
        toast.error('No products from search')
      }
      setSearchResults(res.data);
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
      <label className="font-semibold text-sm pb-1 block text-accent-content">
                Search
              </label>
              <input
                value={search}
                required={true}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />
              <button
              onClick={displayProducts}
                className="transition duration-200 bg-blue-600 hover:bg-blue-500 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >Show results</button>
                
                
        <div className="selected-products-grid max-w-7xl mx-auto">
          {searchResults.map((product)=>{
     return <ProductElement
      key={product.product_id}
      id={product.product_id}
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

export default Search_Products;

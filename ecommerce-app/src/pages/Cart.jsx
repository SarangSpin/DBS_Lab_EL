import React, { useEffect , useState} from 'react'
import { CartItemsList, CartTotals, SectionTitle } from '../components'
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import  Axios  from 'axios';
const Cart = () => {

  const queryParams = new URLSearchParams(location.search);
  
  const navigate = useNavigate();
  const [cart, setCart] = useState([])

  const deleteCart = async() =>{
    Axios({
      method: 'GET',
      url: `http://localhost:8080/deleteCart?cart_id=${queryParams.get('cart_id')}`,
      withCredentials: true
  }).then((res)=>{

    if(res.data == 'Authentication required' || res.data == 'Incorrect token')
    {
      toast.error(res.data)
      navigate('/login')
    }
  
    if(res.data != 'Error deleting cart')
    {
      console.log(res.data)
     
    }
    else{
      toast.error(res.data)
    }
  
    
  }).catch(err=>{
    toast.error('Error deleting cart');
  })
  }

  useEffect(()=>{

    Axios({
      method: 'GET',
      url: `http://localhost:8080/getCart?cart_id=${queryParams.get('cart_id')}`,
      withCredentials: true
  }).then((res)=>{

    if(res.data == 'Authentication required' || res.data == 'Incorrect token')
    {
      toast.error(res.data)
      navigate('/login')
    }
  
    if(res.data != 'Error adding to cart')
    {
      console.log(res.data)

     setCart(res.data)
     
    }
    else{
      toast.error(res.data)
    }
  
    
  }).catch(err=>{
    toast.error('Error creating cart');
  })
  }, [])

  return (
    <>
    <SectionTitle title="Cart" path="Home | Cart" />
    <div className='mt-8 grid gap-8 lg:grid-cols-12 max-w-7xl mx-auto px-10'>
        <div className='lg:col-span-8'>
          <h1 className="text-5xl max-sm:text-3xl text-accent-content">Items</h1>
          <br />
          {cart.map((item)=>{
            return <div>
              <Link to={`/shop/product?pid=${item.item_id}`}><h2 className="text-4xl max-sm:text-3xl text-accent-content">{item.prod_name}</h2></Link>
            
            </div>
            
          })}
          <br />
          <br />
          <Link to={`/`} onClick={()=>{
                 toast.success('Order Placed! Thank you, cart is empty')
            deleteCart()

            }}>Finish Payment</Link>
        </div>
      </div>
    </>
  )
}

export default Cart
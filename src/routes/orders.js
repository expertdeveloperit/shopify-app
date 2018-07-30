const dotenv = require('dotenv').config();
const express = require('express');
const request = require('request-promise');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
//settings
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const mongo_db = process.env.SHOPIFY_MONGO_DB;
const shopifyAppModel = require('./../models/shopify_app');
const forwardingAddress = process.env.APP_URL; // Replace this with your HTTPS Forwarding address


router.get('/order', (req, res) => {
  shopifyAppModel.find({},'storeInfo.domain',function(err,data){
	  	if(err){
	  	}
		res.render('pages/order',{
		    error:false,
		    stores:data,
		    data:"",
		    forwardingAddress,
		    found:false
		});	
  	});  
});

router.post('/order', (req, res) => {
	let orderId = req.body.order_id.trim();
	let requestEmail = req.body.email;
	let storeId = req.body.store;
	let storesList = "";
		shopifyAppModel.find({},'storeInfo.domain',function(err,stores){
		  	storesList = stores;
	  	});
		shopifyAppModel.findOne({'_id':storeId},function (err, store) {
		
		if(store && !err){   
	    	const shopRequestUrl = `https://`+store.storeInfo.myshopify_domain+`/admin/orders/`+orderId+`.json`;
		    const accessToken = store.storeInfo.accessToken ;
		    console.log(shopRequestUrl,"shopRequestUrl");
		    const shopRequestHeaders = {
		      'X-Shopify-Access-Token': accessToken,
		    };

		    request.get(shopRequestUrl,{headers:shopRequestHeaders})
		    .then((shopResponse) => {
		    	let response = JSON.parse(shopResponse);
		    	let order = response.order;
		    	let error = true;
		    	let data = "";
		    	let found = true;
		    	if(order.email == requestEmail && order ){
		    		error = false;		
		    		data = order;
		    		found = true;
		    	}else{
		    		data = "We could't find this order.";
		    		found = false;
		    	}
		    	console.log(data);
		    	res.render('pages/order',{
				    error,
				    data,
				    stores:storesList,
				    forwardingAddress,
				    email:requestEmail,
				    storeid: storeId,
				    order_id : orderId,
				    found
				});	
		    }).catch((error) => {
	        	res.render('pages/order',{
				    error:true,
				    data:error,
				    stores:storesList,
				    forwardingAddress,
				    email:requestEmail,
				    storeid: storeId,
				    order_id : orderId,
				    found:false
				});	
	      });
		}
});	
});

module.exports = router;
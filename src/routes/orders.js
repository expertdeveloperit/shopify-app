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
	let orderId = req.body.order_id;
	let requestEmail = req.body.email;
	let store = req.body.store;
	store = store.replace('http://','').replace('https://','').split(/[/?#]/)[0];
		shopifyAppModel.findOne({'storeInfo.domain':store},function (err, store) {
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
			    		res.status(200).json({
				            data:order,
				            status: true,
				          });
			    	}else{
			    		res.status(200).json({
				            data:"We could't find this order.",
				            status: false,
				        });
			    	}
			    }).catch((error) => {
			    	res.status(500).json({
			            data:error,
			            status: false,
		            });
		        });
			}else{
				res.status(500).json({
		            data:err,
		            status: false,
		        });
			}
		});	
});

module.exports = router;
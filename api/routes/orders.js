const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const checkAuth = require('../../middleware/check-auth');

router.get('/', checkAuth,(req,res,next)=>{
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    Order.find()
        .select('_id quantity product')
        .populate('product', 'name')
        .exec()
        .then(orders=>{
            const response = {
                count: orders.length,
                products: orders.map(order=>{
                    return {
                        _id: order._id,
                        quantity: order.quantity,
                        product: order.product,
                        request: {
                            type: 'GET',
                            url: fullUrl + "/" +order._id
                        }
                }})
            };
            res.status(200).json(response);
        }).catch(err=>{
            res.status(500).json({
                error: err
            })
        });
});
router.post('/', checkAuth,(req,res,next)=>{
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    Product.findById(req.body.productId)
        .then(product=>{
            if (!product) {
                return res.status(404).json({
                    message: 'Product not found.'
                })
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save()
        })
        .then(result=>{
            res.status(201).json({
                message: 'Order created.',
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity,
                    request: {
                        type: 'GET',
                        url: fullUrl+ '/' + result._id
                }},
            });
         }).catch(err=>{
             res.status(500).json({
                 error: err
             })
         });


});
router.get('/:orderId', checkAuth,(req,res,next)=>{
    const id  = req.params.orderId;
    Order.findById(id)
        .select('_id quantity product')
        .populate('product')
        .exec()
        .then(doc=>{
            if(doc){
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') + '/orders'
                    }
                });
            } 
            else res.status(404).json({error: 'No entry found for provided order ID'});
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({error: err});
        });
});
router.delete('/:orderId', checkAuth,(req,res,next)=>{
    const id = req.params.orderId;
    Order.remove({_id: id})
    .exec()
    .then(docs=>{
        res.status(200).json({
            message: 'Deleted seccessfully.',
            request: {
                type: 'POST',
                url: req.protocol + '://' + req.get('host') + '/orders',
                body: {
                    productId: 'ObjectId',
                    quantity: 'Number'
                }
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/product');
const checkAuth = require('../../middleware/check-auth');
router.get('/',(req,res,next)=>{
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    Product.find()
        .select('_id name price')
        .exec()
        .then(docs=>{
            const response = {
                count: docs.length,
                products: docs.map(doc=>{
                    return {
                        name: doc.name,
                        price: doc.price,
                        id: doc._id,
                        request: {
                            type: 'GET',
                            url: fullUrl + "/" +doc._id
                        }
                }})
            };
            res.status(200).json(response);
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json(err);
        });
});
router.post('/', checkAuth,(req,res,next)=>{
    const product = new  Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save()
            .then(result=>{
                const response = {
                    message: 'Product created successfully.',
                    createdProduct: {
                        name: result.name,
                        price: result.price,
                        id: result._id
                    }
                }
                res.status(201).json(response);
            })
            .catch(err=>{
                res.status(500).json({error:err});
            });

});
router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.findById(id)
        .select('_id name price')
        .exec()
        .then(doc=>{
            if(doc){
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') + '/products'
                    }
                });
            } 
            else res.status(404).json({error: 'No entry found formprovided product ID'});
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({error: err});
        });
});
router.patch('/:productId', checkAuth,(req,res,next)=>{
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id},{$set:updateOps})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: 'Product updated.'
            });
        })
        .catch(err=>{
            res.status(500).json({error: err});
        });
});
router.delete('/:productId', checkAuth, (req,res,next)=>{
    const id = req.params.productId;
    Product.remove({_id: id})
    .exec()
    .then(docs=>{
        console.log(docs);
        res.status(200).json({
            message: 'Deleted seccessfully.'
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;
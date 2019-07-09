const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/product');
router.get('/',(req,res,next)=>{
    res.status(200).json({
        message: 'Handling GET requests to /products'
    });
});
router.post('/',(req,res,next)=>{
    const product = new  Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save()
            .then(result=>{
                console.log(result);
                res.status(200).json({
                    createdProduct: result
                });
            })
            .catch(err=>{
                console.log(err);
                res.status(500).json({error:err});
            });

});
router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.findById(id)
        .exec()
        .then(doc=>{
            console.log(doc);
            if(doc) res.status(200).json(doc);
            else res.status(404).json({error: 'No entry found formprovided product ID'});
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({error: err});
        })
});
router.patch('/:productId',(req,res,next)=>{
    res.status(200).json({
        message: 'Updated Successfully.',
        id: req.params.productId
    });
});
router.delete('/:productId',(req,res,next)=>{
    res.status(200).json({
        message: 'Delete successfully.',
        id: req.params.productId
    });
});

module.exports = router;
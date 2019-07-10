const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.get_all_users = (req,res,next)=>{
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    User.find()
        .select('_id email')
        .exec()
        .then(users=>{
            const response = {
                count: users.length,
                products: users.map(user=>{
                    return {
                        email: user.email,
                        id: user._id,
                        request: {
                            type: 'GET',
                            url: fullUrl + "/" +user._id
                        }
                }})
            };
            res.status(200).json(response);
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json(err);
        });
}

exports.user_signup = (req,res,next)=>{
    User.find({email: req.body.email})
        .exec()
        .then(existingUser=>{
            if (existingUser.length>=1){
                return res.status(409).json({
                    message: 'User already exists.'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err,hash)=>{
                    if (err) {
                        res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User ({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(user=>{
                                res.status(201).json({
                                    message: 'User created successfully',
                                    userDetails: user
                                })
                            }).catch(err=>{
                                res.status(500).json(err)
                            })
                    }
                })
            }
        })

}

exports.user_login = (req,res,next)=>{
    User.find({email:req.body.email})
        .exec()
        .then(user=>{
            if(user.length<1){
                return res.status(401).json({
                    message: 'Auth fails!'
                })
            }
            bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
                if(err){
                    return res.status(401).json({
                        message: 'Auth fails!'
                    })
                }
            if(result){
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id 
                },process.env.JWT_KEY,{ expiresIn: '1h' });
                res.status(200).json({
                    message: 'Auth successful',
                    token: token
                })
            } else {
                res.status(401).json({
                    message: 'Auth fails!'
                })  
            }
        }) }) 
}

exports.delete_user = (req,res,next)=>{
    console.log(req.params.userId);
    
    User.remove({_id: req.params.userId})
        .exec()
        .then(user=>{
            res.status(200).json({
                message: 'User deleted suceesfully'
            })
        }).catch(err=>{
            res.status(500).json({
                error: err
            })
        });
}
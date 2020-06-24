const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const userSchema = mongoose.Schema({    // A Mongoose schema defines the structure of the doc, default values, validators, etc.
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // remove all spaces
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// Encrypt the user password - $npm install bcrypt --save
userSchema.pre('save', function(next){  // .pre('save') means the function runs before the user.save() in index.js
    var user = this;

    // if the user's password is changed, it should be encrypted.
    if(user.isModified('password')){
        // Generate bcrypt
        bcrypt.genSalt(saltRounds, function(err, salt){ // saltRounds = 10 (10 digits of password)
            if(err) return next(err)
            
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else{
        next()
    }
})

// Create 'comparePassword' method
userSchema.methods.comparePassword = function(plainPassword, cb){
    // Should see if the plain password and the encrypted password are matched up. - Use bcrypt.compare()
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

// Create 'generateToken' method
userSchema.methods.generateToken = function(cb){
    var user = this;
    
    // By using jsonwebtoken, generate a token.
    var token = jwt.sign(user._id.toHexString(), 'secretToken');

    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    });
}

// Create 'findByToken' method
userSchema.statics.findByToken = function(token, cb){
    var user = this;

    // Decode the token
    jwt.verify(token, 'secretToken', function(err, decoded){
        // Verify if the tokens stored in client's cookie and server are matched up.
        user.findOne({"_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user) 
        })
    })
}

const User = mongoose.model('User', userSchema) // A model is a wrapper on the Mongoose schema.
module.exports = {User} // By exporting the model, it can be used anywhere.
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const BcryptSalt = require('bcrypt-salt')
const bs = new BcryptSalt()
const saltRounds = bs.saltRounds >= 10 ? bs.saltRounds : 10


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(value) {
                return validator.isEmail(value);
            },
            message: 'Invalid email format'
        }
    },
    phone: {
        type: String,
        validate: {
            validator: function(value) {
                return validator.isMobilePhone(value);
            },
            message: 'Invalid phone format'
        }
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    gender: {
        type: String,
    },
    password:{
        type:String,
        required:true
    }
    ,
    profile:{
        type:String
    },
    role:{
        type:String,
        default:'Admin'
    }

})

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, saltRounds)
    next()
})


module.exports = mongoose.model('User', userSchema)

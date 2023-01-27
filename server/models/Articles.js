const mongoose=require('mongoose')
const slug=require('slugify')
const validator = require('mongoose-validator')
const sanitizeHtml = require('sanitize-html')

//Comments Schema
const commentSchema = new mongoose.Schema({
    author: { type: String },
    text: { type: String },
    date: { type: Date, default: Date.now },
    reply: [commentSchema],
    set:function (text) {
        return sanitizeHtml(text)
    }
})

const articleSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength: 10,
        maxlength: 100
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    imagelink:{
        type:String,
        required:true,
        validate: validator({
            validator: 'isURL',
            message: 'Invalid URL'
        })
    },
    author:{
        type:String
        
    },
    description:{
        type:String,
        required:true,
        minlength:50,
        maxlength:1000,
        set: function (markdown) {
            return sanitizeHtml(markdown)
        }
    },
    markdown:{
        type:String,
        required:true,
        minlength:50,
        maxlength:15000,
        set: function (markdown) {
            return sanitizeHtml(markdown)
        }
    },
    category:{
        type:String,
        required:true
    },
    comments:[commentSchema],
    tags:{
        type:String,
        required:false
    },
    slug:{
        type:String,
        required:true,
        unique:true
    }
})
//Creating an index for seaching articles
async function createTextIndex(){
    try {
        await articleSchema.index({ title: 'text', markdown: 'text' }, { name: 'TextIndex' })
        console.log("Index created successfully");
    } catch (err) {
        console.error("Error while creating index: ", err)
    }
}
createTextIndex()




articleSchema.pre('validate',function(next){
    if (this.title){
        this.slug=slugify(this.title,{lower:true,
        strict:true})
    }
    next()
})

module.exports =mongoose.model('Article',articleSchema)
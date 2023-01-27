const express=require('express')
const router=express.Router()
const Article=require('../models/Articles')

router.get('/', (req,res)=>{
    res.render('index.ejs')
 })

 router.get('/:slug',async (req,res)=>{
   const article=await Article.findOne({slug:req.params.slug})
    if (article==null)
        res.redirect('/')
res.render('single-post.ejs',{article:article})
 })
 
 router.post('/article',(req,res)=>{
   req.article=new Article()
   next()
 },saveArticleAndRedirect('newArticle'))

 function saveArticleAndRedirect(path){
   const article=Article
   return async (req, res)=>{
           let article=req.article
           article.title=req.body.title
           article.imageLink=req.body.imageLink
           article.description=req.body.description
           article.markdown=req.body.markdown
       
       try {
           article=await article.save()
           res.redirect(`/articles/${article.slug}`)
       } catch (e) {
          res.render(`articles/${path}`,{article:article}) 
       }
   }
}
 module.exports=router
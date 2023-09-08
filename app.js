const express=require('express')
const session = require('express-session')
const connectDb=require('./config/dbConnect')
const userRouter=require('./routes/userRouter')
const adminRouter=require('./routes/adminRouter')
const sharp=require('sharp')
const multer=require('multer')
const upload=require('./middlewares/multer')

const app=express()

connectDb()

app.use(session({
    secret:'secret',
    saveUninitialized:true,  
    resave:false
}))
app.use((req,res,next)=>{
    res.header('Cache-Control','private, no-cache,no-store,must-revalidate')
    next()
})

app.set('view engine','ejs')

app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({extended:true}))


 
app.use('/',userRouter)
app.use('/admin',adminRouter)



app.listen(4000,()=>{console.log('http://localhost:4000')})
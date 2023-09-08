
const mongoose=require('mongoose')
const {array} = require('../middlewares/multer')
const bannerSchema=new mongoose.Schema({

    BannerName:{
        type:String,
        required:true
    },
    image:{
        type:Object,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:'unblock'

    }
})
const bannerModel=mongoose.model('banner',bannerSchema)
module.exports = bannerModel
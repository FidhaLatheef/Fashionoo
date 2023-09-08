const express=require('express')
const controller=require('../controller/adminController')
const adminModel=require('../models/adminModel')
const userModel=require('../models/userModel')
const router=express.Router()
const VerifyAdmin=require('../middlewares/verifyAdmin')
const upload = require('../middlewares/multer')

router.get('/',controller.adminHome)
router.get('/login',controller.adminLogin)

router.use('VerifyAdmin',VerifyAdmin)

router.get('/productMngt',controller.productMngt)
router.get('/orderMngt',controller.orderMngt)
router.get('/categoryMngt',controller.categoryMngt)
router.get('/bannerMngt',controller.bannerMngt)
router.get('/couponMngt',controller.couponMngt)
router.get('/userMngt',controller.userMngt)
router.get('/logout',controller.adminLogout)



router.get('/addProducts',controller.getaddproduct)
router.get('/addCategory',controller.getaddcategory)
router.get('/addCoupon',controller.getaddCoupon)
router.get('/addBanner',controller.getaddBanner)

router.post('/login',controller.postadminLogin)
router.post('/block-user/:id',controller.getuserBlock) 
router.post('/unblock-user/:id',controller.getuserUnblock)
router.post('/addProducts',upload.fields([{name:'images', maxCount:12},{name:'image', maxCount:"1"}]),controller.postaddProducts)
router.post('/addCategory',controller.postAddCategory)
router.post('/addCoupon',controller.postAddCoupon)
router.post('/addBanner',upload.fields([ { name: "image", maxCount: "1" }, ]), controller.postaddBanner);
 
   


router.post('/list-product/:id',controller.listProduct)
router.post('/unlist-product/:id',controller.unlistproduct)
router.post('/list-category/:id',controller.listcategory)
router.post('/unlist-category/:id',controller.unlistcategory)
router.post('/list-coupon/:id',controller.listCoupon)
router.post('/unlist-coupon/:id',controller.unlistCoupon)


router.get('/productEdit/:id',controller.editProduct) 
router.post('/productEdit/:id',upload.fields([{name:'images', maxCount:12},{name:'image', maxCount:"1"}]),controller.posteditProduct) 

router.get('/editCoupon/:id',controller.editCoupon) 
router.post('/editCoupon/:id',controller.posteditCoupon) 


module.exports=router




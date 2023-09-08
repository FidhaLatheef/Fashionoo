// const { Router } = require('express')
const express=require('express')
const controller=require('../controller/userController')
const VerifyUser=require('../middlewares/verifyUser')
const router=express.Router()

 

router.get('/signup',controller.getSignupPage)
router.get('/login',controller.getLoginPage)
router.get('/logout',controller.userLogout)
router.post('/signup',controller.postSignupPage)
router.post('/login',controller.postLoginPage)
router.get('/',controller.getHomePage)

/// OTP
router.post('/resendOTP',controller.resendotp)
router.get('/resendOTP',controller.resendotp)
router.post('/resendotp',controller.resendotp)
router.post('/otp',controller.postVerifyOtp)
router.get('/otp',controller.getVerifyOtp)

router.post ('/forgetPassword',controller.postforgetPassword)
router.post('/verifyPassword',controller.getVerifyPassword)
router.post('/resetPassword',controller.postVerifyPassword)
router.get('/forgetPassword',controller.getforgetpassword)
router.get('/verifyPassword',controller.getVerifyPassword)
//// 



router.get('/about',controller.getaboutPage)
router.get('/contact',controller.getcontactPage)


/// Product
router.get('/products',controller.getproductPage)


router.get('/filter-product',controller.getfilterProduct)
router.get('/sort-product',controller.getsortProduct)
router.get('/productDetails/:id',controller.getproductDetails)
router.get('/search-product',controller.searchProduct)


// router.get('/products', searchAndFilterProducts);

/// Wishlist
router.get("/wishlist", controller.wishlist);
router.get("/addto-wishlist/:id", controller.addtowishList);
router.get("/remove-wishlist/:id", controller.removeWishlist);

/// Cart
router.get("/cart", controller.getCartPage);
router.get("/addto-cart/:id", controller.addtoCart);
router.get("/remove-cart/:id", controller.removeCart);
router.get("/add-quantity/:id", controller.addQuantity);
router.get("/minus-quantity/:id", controller.minQuantity);

/// CHECKOUT
router.get("/product-checkout", controller.getcheckout);
router.post("/product-checkout", controller.postCheckout);

/// PROFILE
router.get('/profile',controller.getuserProfile)
router.get('/edit-profile',controller.getEditProfile)
router.post('/edit-profile',controller.postEditProfile)
router.get('/add-address',controller.getAddress)
router.post('/add-address',controller.postAddress)
router.get('/delete-address/:id',controller.deleteAddress)
router.get('/edit-address/:id', controller.getEditAddress)
router.get('/placeOrder',controller.placeOrder)

/// ORDER
router.get("/orders", controller.getOrders);


module.exports=router;
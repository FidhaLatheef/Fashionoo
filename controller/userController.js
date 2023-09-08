const userModel = require('../models/userModel')
const userRouter = require('../routes/userRouter')
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const bannerModel=require('../models/bannerModel')
const orderModel=require('../models/orderModel')
const sendOtp = require('../actions/otp')
const idcreate = require("../actions/idcreate");

module.exports = {

  //  HOME PAGE //
  getHomePage: async(req, res) => {

    if (req.session.user) {
      
      const banner=await bannerModel.find({status:'unblock'}).lean();
      res.render('userHome',{banner})
    }
    else {
      res.redirect('/login')
    }

  },
  //  LOGIN PAGE//
  getLoginPage: (req, res) => {

    if (req.session.user) {
      res.redirect('/')
    } else {
      res.render('userLogin')
    }

  },
  postLoginPage: async (req, res) => {
    const { email, password } = req.body
    // console.log(email, password)
    let user = await userModel.findOne({ email })
    // console.log(user)
    if (user) {
      if (user.status == 'block') {
        const fieldRequired = ' Account Blocked'
        res.render('userLogin', { fieldRequired })

      } else {
        if (password == user.password) {
          req.session.user = { name: user.name, id: user._id }
          res.redirect('/')
        } else {
          res.render('userLogin', { error: true })
        }
      }
    } else {
      res.render('userLogin', { error: true })
    }
  },



  //   SIGNUP //
  getSignupPage: (req, res) => {

    if (req.session.user) {
      res.redirect('/')
    } else {
      res.render('userSignUp')
    }
  },
  postSignupPage: async (req, res) => {

    const { email, name, mobile, password, confirmpassword } = req.body
    const user = await userModel.findOne({ email })
    console.log(user)

    if (user) {

      return res.render('userSignUp', { duplicate: 'user already found' })

    } if (name == '' || email == '' || password == '' || mobile == '' || confirmpassword == '') {

      const fieldRequired = ' All Fields Are Required'
      res.render('userSignUp', { fieldRequired })

    } else {

      if (password != confirmpassword) {
        res.render('userSignUp', { passworder: 'passwords are not same' })

      } else {
        randomOtp = Math.floor(Math.random() * 10000)
        req.session.otp = randomOtp
        console.log(randomOtp)

        sendOtp(req.body.email, randomOtp).then(() => {
          return res.render("otp", { user: req.body })
        })
          .catch((err) => {
            return res.render('userSignUp', { error: true, message: 'email sent failed' })

          })
      }
    }
  },
  //    OTP   //
  getVerifyOtp: (req, res) => {
    res.render('otp')
  },

  postVerifyOtp: async (req, res) => {

    const { name, email, password, mobile } = req.body

    // const Email=req.body.email
    // console.log(Email+ "OTPEMAIL")

    if (req.body.otp == req.session.otp) {
      console.log('otp verified')

      const user = new userModel({ name, email, mobile, password });
      console.log(user)

      user.save((err, data) => {

        if (err) {
          res.render("otp", { error: true, message: "Something went wrong", ...req.body })
          console.log(err)
        } else {
          req.session.user = {
            name,
            id: user._id
          }
          res.redirect("/");
        }
      })
    } else {
      res.render("otp", { error: true, otpmessage: "Invalid OTP", ...req.body })
    }
  },

  //  USER LOGOUT   //
  userLogout: (req, res) => {

    req.session.user = null
    res.redirect('/login')

  },

  getaboutPage: (req, res) => {
    res.render('about')
  },

  ///////////////////////////////////////////////          PRODUCT PAGE STARTS     /////////////////////////////////////////////

  getproductPage: async (req, res) => {
    try {
      if (req.session.user) {
        id = req.params.id
        // let products = await productModel.find({})
        let categories = await categoryModel.find({})
        req.session.pageNum = parseInt(req.query.page ?? 1);
      req.session.perpage = 6;
      let products = await productModel
        .find()
        .countDocuments()
        .then((documentCount) => {
          docCount = documentCount;
          return productModel
            .find()
            .skip((req.session.pageNum - 1) * req.session.perpage)
            .limit(req.session.perpage)
            .lean();
        });
      username = req.session.user;
      let pageCount = Math.ceil(docCount / req.session.perpage);
      let pagination = [];
      for (i = 1; i <= pageCount; i++) {
        pagination.push(i);
      }
        // console.log(products)

        res.render('product', { products, categories,pagination })
      }
    } catch (err) {
      console.log(err)
    }

  },
  // getproductDetails: async (req, res) => {
  //   try {
  //     if (req.session.user) {
  //       console.log(req.params.id)
  //       const product = await productModel.findById({ _id: req.params.id })
  //       id = req.params.id
  //       res.render('productDetails', { product })
  //     }
  //   } catch {
  //     next(err)
  //   }
  // },
  
 
  getproductDetails: async (req, res) => {
    try {
      const id = req.session.user.id;
    
      const user = await userModel.findById({ _id: id }).lean();
   
      const _id = req.params.id;
  
  
      const product = await productModel.findById(_id).lean();
     
  
      // Check if the product is in the user's wishlist
      const inWishlist = user && Array.isArray(user.wishlist) && user.wishlist.includes(_id);
  
      // Render the page with the appropriate value for the "wish" parameter
      res.render("productDetails", { product, wish: inWishlist });
    } catch (err) {
     
      console.log(err);
    }
  },
  
////////////////////////////////    SEARCH  FILTER  SORT  //////////////////////////

  searchProduct: async (req, res) => {
    try {

      let key = req.query.search
      console.log(key)
      let products = await productModel.find({ $or: [{ description: { $regex: key, $options: 'i' } }, { name: { $regex: key, $options: 'i' } }] })
      const categories=await categoryModel.find({})
      let pagination=[]

      // console.log(product)  
      res.render('product', { products,categories,pagination })

    } catch (err) {

      next(err)
    }

  },
  getfilterProduct: async (req, res) => {

    try {

      const name = req.query.filterBy;
      console.log(name)
      const products = await productModel.find({ category: name }).lean()
      const categories = await categoryModel.find({})
      let pagination=[]

      res.render('product', { products, categories,pagination })
    } catch (err) {
      next(err)
    }

  },

  getsortProduct: async (req, res) => {
    try {

      const name=req.query.SortBy;
      console.log(name+'   1')

      if(name=='low-high'){

        const products=await productModel.find().sort({price:1}).lean()
        const categories=await categoryModel.find({})
        let pagination=[]

        console.log(products+'   2')

        res.render('product',{products,categories,pagination})

      }else if(name=='high-low'){
        const products=await productModel.find().sort({price:-1}).lean()
        const categories=await categoryModel.find()
        let pagination=[]
        res.render('product',{products,categories,pagination})
      }else{

        const products=await productModel.find().lean()
        res.render('product',{products})
      }
    }catch(err){
      console.log('ERRORR IS THERE')
      next(err)
    }

  },
  // searchAndFilterProducts: async (req, res) => {
  //   try {
  //     let key = req.query.search;
  //     let name = req.query.filterBy;
  //     let sortName = req.query.SortBy;
  //     let pageNum = parseInt(req.query.page ?? 1);
  //     let perpage = 6;
  
  //     let query = {
  //       $or: [
  //         { description: { $regex: key, $options: 'i' } },
  //         { name: { $regex: key, $options: 'i' } }
  //       ]
  //     };
  
  //     if (name) {
  //       query.category = name;
  //     }
  
  //     let sortQuery = {};
  
  //     if (sortName == 'low-high') {
  //       sortQuery.price = 1;
  //     } else if (sortName == 'high-low') {
  //       sortQuery.price = -1;
  //     }
  
  //     let productsCount = await productModel.countDocuments(query);
  //     let pageCount = Math.ceil(productsCount / perpage);
  
  //     let pagination = [];
  
  //     for (i = 1; i <= pageCount; i++) {
  //       pagination.push(i);
  //     }
  
  //     let products = await productModel.find(query)
  //       .skip((pageNum - 1) * perpage)
  //       .limit(perpage)
  //       .sort(sortQuery)
  //       .lean();
  
  //     let categories = await categoryModel.find({});
  
  //     res.render('product', {
  //       products,
  //       categories,
  //       pagination
  //     });
  
  //   } catch (err) {
  //    console.log(err);
  //   }
  // },
  

  
    wishlist: async (req, res) => {
      try {
         const _id = req.session.user.id;

         const user = await userModel.findById({ _id }).lean();  

        const wishlist = user.wishlist;

        const product = await productModel
          .find({ _id: { $in: wishlist } })
          .lean();
         
        res.render("wishlist", { product });
      } catch (err) {
       
        console.log(err);
      }
    },
    addtowishList: async (req, res) => {
      try {
        const _id = req.session.user.id;
  
        const proId = req.params.id;
        await userModel.updateOne(
          { _id },
          {
            $addToSet: {
              wishlist: proId,
            },
          }
        );
        res.redirect("back");
      } catch (err) {
        res.render("404");
        console.log(err);
      }
    },
  
    removeWishlist: async (req, res) => {
      try {
        const _id = req.session.user.id;
        const id = req.params.id;
  
        await userModel.updateOne(
          { _id },
          {
            $pull: {
              wishlist: id,
            },
          }
        );
  
        res.redirect("back");
      } catch (err) {
        res.render("404");
        console.log(err);
      }
    },

    getCartPage: async (req, res) => {
      try {
        const _id = req.session.user.id;
        const { cart } = await userModel.findOne({ _id }, { cart: 1 });
        const cartList = cart.map((item) => {
          return item.id;
        });
  
        const product = await productModel
          .find({ _id: { $in: cartList } })
          .lean(); 
  
        let totalPrice = 0;
  
        product.forEach((item, index) => {
          totalPrice = totalPrice + item.price * cart[index].quantity;
        });
  
        let totalMrp = 0;
  
        product.forEach((item, index) => {
          totalMrp = totalMrp + item.mrp * cart[index].quantity;
        });
        let empty;
        cart.length == 0 ? (empty = true) : (empty = false);
        res.render("cart", { product, totalPrice, cart, totalMrp, empty });
      } catch (err) {
      
        console.log(err);
      }
    },
  
    addtoCart: async (req, res) => {
      try {
        const _id = req.session.user.id;
        const productId = req.params.id;
  
        await userModel.updateOne(
          { _id },
          { $addToSet: { cart: { id: productId, quantity: 1 } } }
        );
  
        res.redirect("/cart");
      } catch (err) {
      
        console.log(err);
      }
    },
  
    removeCart: async (req, res) => {
      try {
        const _id = req.session.user.id;
        const productId = req.params.id;
  
        await userModel.updateOne(
          { _id },
          {
            $pull: {
              cart: { id: productId },
            },
          }
        );
        res.redirect("/cart");
      } catch (err) {
        
        console.log(err);
      }
    },
  
    addQuantity: async (req, res) => {
      try {
        const user = await userModel.updateOne(
          {
            _id: req.session.user.id,
            cart: { $elemMatch: { id: req.params.id } },
          },
          {
            $inc: { "cart.$.quantity": 1 },
          }
        );
  
        res.json({ user });
      } catch (err) {
      
        console.log(err);
      }
    },
  
    minQuantity: async (req, res) => {
      try {
        let { cart } = await userModel.findOne(
          { "cart.id": req.params.id },
          { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
        );
  
        if (cart[0].quantity <= 1) {
          return res.redirect("/cart");
        }
  
        const user = await userModel.updateOne(
          {
            _id: req.session.user.id,
            cart: { $elemMatch: { id: req.params.id } },
          },
          {
            $inc: {
              "cart.$.quantity": -1,
            },
          }
        );
        return res.json({ user });
      } catch (err) {
        
        console.log(err);
      }
    },
 ///////////////////////////////////////// CHECKOUT PAGE  //////////////////////////////////////////////////////////////   
 getcheckout: async (req, res) => {
  try {
    let totalPrice = 0;
    const id = req.session.user.id;
    const user = await userModel.findById({ _id: id }).lean();
    for (const i of user.cart) {
      let product = await productModel.findOne({ _id: i.id });
      totalPrice = totalPrice + product.price * i.quantity;
    }
    res.render("checkout", { user, totalPrice });
  } catch (err) {
   
    console.log(err);
  }
},
//  getcheckout: async (req, res) => {   

//       try {
//         const _id = req.session.user.id;
//         const { cart } = await userModel.findOne({ _id }, { cart: 1 });
//         const cartList = cart.map((item) => {
//           return item.id;
//         });
  
//         const product = await productModel
//           .find({ _id: { $in: cartList } })
//           .lean(); 
//         let totalPrice = 0;
  
//         product.forEach((item, index) => {
//           totalPrice = totalPrice + item.price * cart[index].quantity;
//         });
//         const user = await userModel.findById({ _id }).lean();

//         res.render("checkout", { user, totalPrice });
//       } catch (err) {
        
//         console.log(err);
//       }
//     },

  
    postCheckout:async(req,res)=>{
      try {
        const _id = req.session.user.id;
        const { cart } = await userModel.findOne({ _id }, { cart: 1 });
        console.log(cart);
  
        const cartList = cart.map((item) => {
          return item.id;
        });
        console.log(cartList);
        const product = await productModel
          .find({ _id: { $in: cartList } })
          .lean();
  
        let totalPrice = 0;
  
        product.forEach((item, index) => {
          totalPrice = totalPrice + item.price * cart[index].quantity;
        });
        console.log(totalPrice);
  
        let { address } = await userModel.findOne(
          { _id },
          { _id: 0, address: { $elemMatch: { id: req.body.address } } }
        );
        console.log(address);
  
        req.session.userAddress = {
          id: address[0].id,
        };
        if (req.body.payment == "cod") {
      let orders = [];
      let i = 0;

      for (let item of product) {
        const cartQuantity = cart[i].quantity;
        if (cartQuantity > 0) {
          console.log('greater than 0')
          await productModel.updateOne(
            { _id: item._id },
            {
              $inc: {
                quantity: -1 * cartQuantity,
              },
            }
          );
          totalPrice = cartQuantity * item.price;
          orders.push({
            address: address[0],
            orderItems: item,
            userId: req.session.user.id,
            quantity: cartQuantity,
            totalPrice: req.body.total,
            paymentType: req.body.payment,
          });
        }
        i++;
      }
      


    
      const order = await orderModel.create(orders);
      await userModel.findByIdAndUpdate(req.session.user.id, {
        $set: { cart: [] },
      });

      res.render("orderSucsess");
    }  } catch (error) {
   
    console.log(error);
    }

  
      // const {address,total,payment}=req.body
      // if(payment=="cod"){
      //     const {cart}=await userModel.findOne({_id:req.session.user.id},{cart:1}).lean()
      //     const prodId=cart.map(item=>{
      //       return item.id
      //     })
      //     console.log('proId=',prodId)
      //   const product=await productModel.find({_id:{$in:{prodId}}}).lean()
      //   console.log(product)
      // }
      // console.log(req.body)
    },

  ///////////////////////////////////////////////       PRODUCT PAGE ENDS      //////////////////////////////////////////////

  getcontactPage: (req, res) => {
    res.render('contact')
  },

  getforgetpassword: (req, res) => {
    res.render('forgetpassword')
  },

  postforgetPassword: async (req, res) => {

    const { email } = req.body
    console.log(email + '  1')

    const user = await userModel.findOne({ email })

    if (user) {
      req.session.user = { name: user.name, id: user._id }

      randomOtp = Math.floor(Math.random() * 10000)
      console.log(randomOtp + '  2')
      req.session.otp = randomOtp

      sendOtp(req.body.email, randomOtp).then(() => {
        console.log(req.body + '  3')
        return res.render("passwordotp", { user: req.body })
      })

      const { otp } = req.body
      if (otp == req.session.otp) {
        return res.redirect('/verifyPassword')

      }
    }
  },

  resendotp: async (req, res, next) => {
    try {
      const { email } = req.body;
      // console.log(req.body+ "email for resend")

      // generate a new OTP and store it in the session
      const randomOtp = Math.floor(Math.random() * 10000);
      console.log(randomOtp + "  4");
      req.session.otp = randomOtp;

      // send the new OTP to the user's email address
      sendOtp(email, randomOtp)
        .then(() => {
          console.log(req.body + "5");
          return res.render("passwordotp", { user: req.body });
        })
        .catch((err) => {
          // handle the error appropriately
          console.error(err);
          return res.status(500).send("Failed to send OTP");
        });
    } catch (err) {
      next(err);
    }
  },


  getVerifyPassword: async (req, res) => {

    res.render('resetPassword')
  },

  postVerifyPassword: async (req, res) => {

    const { password, confirmPassword } = req.body
    console.log(req.body)

    if (password === confirmPassword) {
      console.log('hgadsjh')

      await userModel.updateOne({ _id: req.session.user.id }, { password }, { upsert: true })
      return res.redirect('/login')

    } else {
      res.render('resetPassword')

    }
  },
  ///////////////////////////////////////////   PROFILE  ////////////////////////////////////////////////////////////////
  
  getuserProfile:async(req,res)=>{
    try{
      const id=req.session.user.id
      console.log(id)
    const user=await userModel.findOne({_id:id}).lean()
    console.log(user)
  

    res.render('userProfile',{user})
    }catch(err){
      console.log(err)

    }
  },
  getEditProfile: async (req, res) => {
    try {
      const id = req.session.user.id;
      const user = await userModel.findById({ _id: id }).lean();
      res.render("profileEdit", { user });
    } catch (err) {
      console.log(err);
    }
  },
  postEditProfile: async (req, res) => {
    const { name, mobile, _id } = req.body;

    try {
      await userModel.findByIdAndUpdate(_id, { $set: { name, mobile } });
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },

  /////////////////////////////////////////  ADDRESS  /////////////////////////////////////////////////////////
  getAddress:async(req,res)=>{
    res.render('addAddress')
  },
  postAddress:async(req,res)=>{
    try {
      const _id = req.session.user.id;

     const user= await userModel.updateOne(
        { _id },
        {
          $addToSet: {
            address: {
              ...req.body,
               id: idcreate(),
            },
          },
        }
      );
      console.log(user.address+"  3")
      res.redirect("/profile");
    } catch (err) {
      
      console.log(err);
    }
   
  },
 
  deleteAddress: async (req, res) => {
    try {
      const id = req.session.user.id
      await userModel.updateOne(
        { _id: req.session.user.id },
        { $pull: { address: { _id: req.body.id } } }
      );
      res.json("deleted"); 
    }
    catch (err) {
      console.log(err)
    }
  },
  getEditAddress: async (req, res) => {
    const id = req.params.id;
    try {
      let { address } = await userModel.findOne({ "address.id": _id },
        { _id: 0, address: { $elemMatch: { id } } }
      );
      res.render("editAddress", { address: address[0] });
    } catch (err) {
      console.log(err);
    }
  },
  ////////////////////////////////////////    ADDRESS ENDS       //////////////////////////////////////////////////////////////
  getOrders: async (req, res) => {
    try {
      const order = await orderModel.find().lean();

      let empty;
      order.length == 0 ? (empty = true) : (empty = false);
      res.render("orders", { order, empty });
    } catch (err) {
      console.log(err);
    }
  },


  placeOrder:async (req,res)=>
  {
    
  }

}




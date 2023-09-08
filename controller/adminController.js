const adminModel = require('../models/adminModel')
const adminRouter = require('../routes/adminRouter')
const userModel = require('../models/userModel')
const categoryModel = require('../models/categoryModel')
const productModel = require('../models/productModel')
const couponModel = require('../models/couponModel')
const bannerModel = require('../models/bannerModel')
const orderModel=require('../models/orderModel')
const sharp=require('sharp')
const fs = require('fs');




module.exports = {

    adminHome: (req, res) => {

        if (req.session.admin) {
            res.render('adminHome')
        } else {
            res.redirect('/admin/login')
        }
    },

    adminLogin: (req, res) => {

        if (req.session.admin) {
            res.redirect('/admin/')
        } else {
            res.render('adminLogin')
        }
    },

    postadminLogin: async (req, res) => {

        const { email, password } = req.body
        const admin = await adminModel.findOne({ email })

        if (admin) {
            if (password == admin.password) {
                req.session.admin = {
                    name: admin.name
                }
                res.redirect('/admin/')
            } else {
                res.render('adminLogin', { err: 'incorrect password' })
            }
        } else {
            res.render('adminLogin', { error: 'please enter all fields' })
        }

    },

    adminLogout: (req, res) => {

        req.session.admin = null
        res.redirect('/admin/login')

    },

    userMngt: async (req, res) => {

        let users = await userModel.find({}, { password: 0 }).lean()
        console.log(users)

        res.render('userMngt', { users })
    },

    getuserBlock: async (req, res) => {
        var id = req.params.id
        console.log(id)

        await userModel.findByIdAndUpdate(id, { $set: { status: 'block' } }).then(() => {

            res.redirect('/admin/userMngt')
        }).catch((err) => {
            console.log(err)
        })

    },

    getuserUnblock: async (req, res) => {
        var id = req.params.id
        console.log(id)

        await userModel.findByIdAndUpdate(id, { $set: { status: 'Unblock' } }).then(() => {

            res.redirect('/admin/userMngt')
        }).catch((err) => {
            console.log(err)
        })

    },

    ///////////////////////////////////////////////// CATEGORY PAGE   //////////////////////////////////////////////////


    categoryMngt: async (req, res) => {

        const categories = await categoryModel.find().lean()
        res.render('categoryMngt', { categories })
    },

    getaddcategory: (req, res) => {
        res.render('addCategory')
    },

    postAddCategory:async (req, res) => {
        const category = req.body.category.toLowerCase();
        const categories=await categoryModel.findOne({category})
       console.log(categories)

        if(categories){
           return res.render('addCategory',{error:true,duplicate:'category already exist'})
        }
        if (category == "") {
            return res.redirect("/admin/addCategory")
        } else {
            // const category = req.body.Category
            console.log(req.body)

            const categories = new categoryModel({ category })

            categories.save((err, data) => {
                if (err) {
                    console.log(err)
                    return res.redirect("/admin/addCategory")
                }
                res.redirect("/admin/categoryMngt")
            })
        }
    },
    listcategory: async (req, res) => {
        var id = req.params.id
        console.log(id)

        await categoryModel.findByIdAndUpdate(id, { $set: { status: 'available' } }).then(() => {

            res.redirect('/admin/categoryMngt')
        }).catch((err) => {
            console.log(err)
        })

    },
    unlistcategory: async (req, res) => {
        var id = req.params.id
        console.log(id)

        await categoryModel.findByIdAndUpdate(id, { $set: { status: 'unavailable' } }).then(() => {

            res.redirect('/admin/categoryMngt')
        }).catch((err) => {
            console.log(err)
        })
    },



////////////////////////////////////////////////////  PRODUCT PAGE   ///////////////////////////////////////////////


    productMngt: async (req, res) => {

        const products = await productModel.find().lean()
        // console.log(products)

        res.render('productMngt', { products })
    },

    getaddproduct: async (req, res) => {

        const categories = await categoryModel.find({}).lean()

        console.log(categories)
        res.render('addProducts', { categories })
    },
    postaddProducts: async (req, res) => {

        const { name, category, quantity, price, brand, description, mrp } = req.body
        const { image, images } = req.files
    
        if (!name || !category || !quantity || !price || !brand || !description || !mrp || !image || !images) {
            const fieldRequired = ' All Fields Are Required'
            const categories = await categoryModel.find().lean()
            res.render('addProducts', {  fieldRequired, categories })
            return
        }else{
             console.log(req.body)
            console.log(req.files.image[0])
            console.log(req.files.images[0])
    
            await sharp(req.files.image[0].path)
                .png()
                .resize(600, 600, {
                    kernel: sharp.kernel.nearest,
                    fit: 'contain',
                    position: 'center',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .toFile(req.files.image[0].path + ".png")
            req.files.image[0].filename = req.files.image[0].filename + ".png"
            req.files.image[0].path = req.files.image[0].path + ".png"
    
            const product = new productModel({
                name, category, quantity, price, brand, description, mrp, mainImage: req.files.image[0],sideImages:req.files.images[0]
                
            })
    
            product.save(async (err, data) => {
                if (err) {
                    console.log(err)
                    const categories = await categoryModel.find().lean()
                    res.render('addProducts', { error: true, message: 'validation filed', categories })
                } else {
                    res.redirect('/admin/productMngt')
                    // console.log('finished')
                }
            })
        }
    
        
    
    },
    
    listProduct: async (req, res) => {
        var id = req.params.id
        console.log(id)

        await productModel.findByIdAndUpdate(id, { $set: { status: 'available' } }).then(() => {

            res.redirect('/admin/productMngt')
        }).catch((err) => {
            console.log(err)
        })

    },
    unlistproduct: async (req, res) => {
        var id = req.params.id
        console.log(id)

        await productModel.findByIdAndUpdate(id, { $set: { status: 'unavailable' } }).then(() => {

            res.redirect('/admin/productMngt')
        }).catch((err) => {
            console.log(err)
        })

    },
    editProduct: async (req, res) => {
        try {
            const id = req.params.id
            const products = await productModel.findOne({ _id: id })
            console.log(products)

            const categories = await categoryModel.find({})
            console.log(categories)

    
            res.render('productEdit', { products, categories })
        } catch (err) {
            next(err)
        }
    },
    
    posteditProduct: async (req, res) => {
        try {
            const id = req.params.id
            const { name, category, quantity, mrp, brand, price, description } = req.body

            console.log(req.body)
            const image = req.files.image[0]
            const images = req.files.images
           
    
                     if (image && images) {
                        const newFilenames = []
            
                        await sharp(image.path)
                            .resize({width: 600, height: 600, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
                            .toFormat('png')
                            .toFile(image.path + '.png')
            
                        image.filename = image.filename + '.png'
                        image.path = image.path + '.png'
            
                        images.forEach((img) => {
                            const filename = img.originalname
                            const newFilename = `fashionoo-Prod-${filename}`
            
                            sharp(img.path)
                                .resize({ width: 1200, height: 1200, fit: 'inside', background: { r: 255, g: 255, b: 255, alpha: 1 } })
                                .toFormat('jpeg', { quality: 100 })
                                .toFile(`public/product-images/${newFilename}`, (err, info) => {
                                    if (err) throw err
                                })
            
                            newFilenames.push(newFilename)
                        })
            
                        const product = await productModel.findOneAndUpdate({ _id: id }, {
                            $set: {
                                name,
                                category,
                                quantity,
                                price,
                                brand,
                                description,
                                mrp,
                                mainImage: image,
                                sideImages: images
                            }
                        })
                        console.log(product)
                        
            
                        await product.save().then(() => {
                            res.redirect('/admin/ProductMngt')
                        })
                    


            }

            }catch (err) {
            console.log(err)
           
        }
    
         
    },
     

     //////////////////////////////////// COUPON PAGE /////////////////////////////////////////////////////


    couponMngt: async (req, res) => {

        let coupon = await couponModel.find({})
        res.render('couponMngt', { coupon })
    },

    getaddCoupon: (req, res) => {
        res.render('addCoupon')
    },

    postAddCoupon: async (req, res) => {

        const { name, cashback, minAmount,maxAmount, expiry, code } = req.body
        // console.log(req.body)

        const coupon = new couponModel({ name, cashback, minAmount,maxAmount, expiry, code })

        coupon.save((err, data) => {
            if (err) {
                console.log(err)
                res.redirect('/admin/addCoupon')
            }
            else {

                res.redirect('/admin/couponMngt')

            }
        })

    },
    editCoupon:async(req,res)=>{

        const coupon=await couponModel.find({_id:req.params.id}); 
        console.log('1')      

        res.render('editCoupon',{coupon})

    },
    posteditCoupon:async(req,res)=>{
        const id=req.params.id
        console.log(req.body+'2')
        const {name, cashback, minAmount,maxAmount, expiry, code}=req.body
        console.log(req.body+'3')

     
        let data = await couponModel.findOneAndUpdate(
            { _id:id }, {
                $set: {
                    name, cashback, minAmount,maxAmount, expiry, code
                 }  
        } 
        )
        await data.save().then(() => {
            res.redirect('/admin/couponMngt')
            
        })
    },

    listCoupon: async (req, res) => {
        var id = req.params.id
        console.log(id)

        await couponModel.findByIdAndUpdate(id, { $set: { status: 'available' } }).then(() => {

            res.redirect('/admin/couponMngt')
        }).catch((err) => {
            console.log(err)
        })

    },
    unlistCoupon: async (req, res) => {
        var id = req.params.id
        console.log(id)

        await couponModel.findByIdAndUpdate(id, { $set: { status: 'unavailable' } }).then(() => {

            res.redirect('/admin/couponMngt')
        }).catch((err) => {
            console.log(err)
        })

    },

    //////////////////////////////////////////////////// BANNER PAGE  ////////////////////////////////////////////



    bannerMngt: async (req, res) => {

        const banners = await bannerModel.find({}).lean()
        console.log('0')
        res.render('bannerMngt', { banners })
    },

    getaddBanner: (req, res) => {
        try {
            res.render('addBanner')
            console.log('1')
        }
        catch (err) {
            next(err)
            console.log('2')
        }
    },

    postaddBanner: async (req, res) => {
        try {
            console.log('postaddbanner')
            const { BannerName, description } = req.body
            const { image } = req.files
            console.log('3')

            console.log(req.files.image[0])
    
            const newBanner = bannerModel({
                BannerName,
                description,
                image: req.files.image[0]
            })
    
            console.log('4')
            console.log(newBanner.image + '5')
            await newBanner.save().then(() => {
                res.redirect("/admin/bannerMngt");
            })
        } catch (err) {
            console.log(err)
            // next(err)
        }
    },
    
    
    listBanner: async (req, res) => {
        var id = req.params.id
        console.log(id)

        await bannerModel.findByIdAndUpdate(id, { $set: { status: 'unblock' } }).then(() => {

            res.redirect('/admin/bannertMgt')
        }).catch((err) => {
            console.log(err)
        })

    },
    unlistBanner: async (req, res) => {
        var id = req.params.id
        console.log(id)

        await bannerModel.findByIdAndUpdate(id, { $set: { status: 'block' } }).then(() => {

            res.redirect('/admin/bannerMngt')
        }).catch((err) => {
            console.log(err)
        })

    },

    ///////////////////////////////////////////// ORDER PAGE ///////////////////////////////////////////
    orderMngt: async (req, res) => {
        try {
          const order = await orderModel.find().lean();
          res.render("orderMngt", { order });
        } catch (err) {
          console.log("ful err");
          console.log(err);
        }
      },

}
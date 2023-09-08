const nodemailer = require('nodemailer')

module.exports = function SendOtp(email,otp){
  
    return new Promise((resolve,reject)=>{

        let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
                    port: 465, // Port for SMTP (usually 465)
                    secure: true, // Usually true if connecting to port 465
                    auth: {
                      user: "fidhalatheefm@gmail.com", // Your email address
                      pass: "fuxpjhzqjgbbwxzu", // Password (for gmail, your app password)
                    },
                  });

                  var mailOptions={
                    from: 'fidhalatheefm@gmail.com',
                    to: email,
                    //  to:Email,
                    subject: "Fashionoo Email verification",
                    html: `
                    <h1>Verify Your Email For Fashionoo</h1>
                      <h3>use this code to verify your email</h3>
                      <h2>${otp}</h2>
                    `,
                  }
              
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      reject("Email sending failed",error)
                    } else {
                      resolve("Email send successfuly")
                    }
                  });
    })
}
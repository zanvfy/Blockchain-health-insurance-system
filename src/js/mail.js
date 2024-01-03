 var nodemailer=require('nodemailer');
let mailTransporter = nodemailer.createTransport({
     service: 'gmail',
        auth: {
        user: 'pavanms11298@gmail.com',
        pass: 'pavanmsp007'
        }
        });
    
    mailDetails = {
        from: 'contentwrito@gmail.com',
        to: 'pavanms11298@gmail.com',
        subject: 'Test mail',
        text: 'Lo bantu nodo!!'
    };
     mailTransporter.sendMail(mailDetails, function(err, data) {
         if(err) {
         console.log('Error Occurs');
         } else {
         console.log('Email sent successfully');
         }
     });
        
       
    
  

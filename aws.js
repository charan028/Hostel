const AWS = require('aws-sdk');
require('dotenv').config();


const ses = new AWS.SES({"accessKeyId":process.env.ACCESSID, "secretAccessKey": process.env.ACCESSKEY, "region": process.env.ACCESSREGION});
let params = {
            // send to list
            Destination: {
                ToAddresses: [
                'charan.m@darwinbox.io'        ]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: "<p>this is test body.</p>"
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: 'Hey, this is test.'
                    }
                },
                
                Subject: {
                    Charset: 'UTF-8',
                    Data: "test"
                }
            },
            Source: 'charan.m@darwinbox.io', // must relate to verified SES account
            ReplyToAddresses: [
                'charan.m@darwinbox.io',
            ],
        };
// this sends the email
ses.sendEmail(params, (err, data) => {
  if (err) console.log(err)
  else console.log(data)
})
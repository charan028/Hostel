const jwt = require("jsonwebtoken");

//const { ConnectionPoolClosedEvent } = require("mongodb");



const config = process.env;



const verifyToken = (req, res, next) => {

console.log("inside jwt");

console.log({"header":res.getHeaders()["authorization"]});

const authHeader = res.getHeaders()['authorization'];

console.log({"auth":authHeader,"auth1":authHeader.split(' ')[1]});

const token = authHeader && authHeader.split(' ')[1]

console.log({"token":token});

if (!token) {

return res.status(403).send("A token is required for authentication");

}





try {

    console.log(config.TOKEN_SECRET)
    
    const decoded = jwt.verify(token, config.TOKEN_SECRET);
    
    req.user = decoded;
    
    console.log(req.user)
    
    console.log("verified");
    
    }
    
    catch (err) {
    
    return res.status(401).send("Invalid Token");
    
    }
    
    return next();
    
    };

module.exports = verifyToken;
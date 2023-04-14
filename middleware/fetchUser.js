const jwt = require("jsonwebtoken");
const JWT_SECRET = "bsu1y8y3kdou28uri2?^@TT*$bge2rt1yjsb1901wt";

const fetchUser = (req, res, next) => {
    // Get the user from the jwt token and add id to req object
    const token = req.header("auth-token");
    if (!token) {
        res.status(401).send({error: "Please authenticate using a valid token"});
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (err) {
        res.status(401).send({error: "Please authenticate using a valid token"});
    }
}

module.exports = fetchUser;
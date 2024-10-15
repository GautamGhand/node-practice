const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); // Load environment variables from .env file
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({
            status: '401',
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).send({
            status: '403',
            error:err.message,
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = authenticateToken;

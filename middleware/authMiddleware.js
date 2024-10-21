const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Failed to authenticate token" });
        }

        req.userId = decoded.id; // Save user id in request for later use
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authMiddleware;

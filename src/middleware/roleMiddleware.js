const authorize = (...role) => {
    return (req, res, next) => {
        console.log("User data:", req.user);  // Debug log
        console.log("User role:", req.user.role); // Debug log
        if (!role.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        next();
    }
}
module.exports = { authorize };
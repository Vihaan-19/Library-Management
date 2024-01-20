const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer"))
        return res.status(401).send("Invalid Authorization");

    try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, process.env.secret_key);
        req.userId = payload.id;
        next();
    } catch (err) {
        res.status(403).send(err);
    }
}

router.post('/issue/:bookId',userController.issue);
router.delete('/view/:bookId',auth, userController.viewBook);

module.exports = router;
import jwt from 'jsonwebtoken'

const authMiddleware = async (req, res, next) => {
    const {token} = req.headers
    if(!token){
        return res.json({
            succes: false,
            message: 'Not Authorized Login Again',
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.userId = decoded.id
        next()
    } catch (err) {
        return res.json({
            succes: false,
            message: 'Invalid token',
            err: err.message,
        })
    }
}

export default authMiddleware
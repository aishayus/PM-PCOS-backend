import userModel from "../models/userModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import validator from 'validator'

//Register User
export const registerController = async(req, res) => {
    //Make sure the fields are filled
    const {name, email, password} = req.body
    if (!name || !email || !password){
        return res.json({
            success: false,
            message: 'All fields required'
        })
    }

    try{
        //Check if the user exists
        const exists = await userModel.findOne({email})
            if (exists){
                res.json({
                    success: false,
                    message: 'Person already exists'
                })
            }
            
        // Check the validity of the mail
            if(!validator.isEmail(email)){
                return res.json({
                    success: false,
                    message: 'Invalid email'
                })
            }

        //CMake sure the password is greater then 8
            if(password.length < 8){
                return res.json({
                    success: false,
                    message: 'Password must be at least 8 characters long'
                })
            }

        //Hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //Create new user storing the hashed password
        const user = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        })

        //Save the user
        await user.save()
        const token = createToken(user.id)

        //Success message
        return res.json({
            success: true,
            token,
            message: 'User created successfully'
        })
    
    //Catch errors
    } catch (err){
        return res.json({
            success: false,
            message: 'Error creating user',
            err: err
        })
    }
}

//Login User
export const loginController = async(req, res) => {
    //Make sure the fields are filled`
    const {email, password} = req.body
    if (!email || !password){
        return res.json({
            success: false,
            message: 'All fields required'
        })
    }

    try{

        //Find the user by email
        const user = await userModel.findOne({ email })
        if (!user){
            res.json({
                success: false,
                message: 'User not found'
            })
        }

        //Compare the password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch){
            res.json({
                success: false,
                message: 'Invalid information'
            })
        }

        const token = createToken(user._id)

        //Success message
        return res.json({
            success: true,
            token,
            message: 'User Logged In Successfully'
        })

    //Catch Error
    } catch (err) {
        return res.json({
            success: false,
            message: 'Error logging in',
            err: err
        })
    }
}
//Creat token and how long the user will be logged in
const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: '7d'
    })
}

//Verify the token
const verifyToken = (req) => {
    const token = req.headers.token
    if (!token) throw new Error('No token provided')
        return jwt.verify(token, process.env.SECRET_KEY)
}

//Get User Info
export const getUserController = async(req, res) => {
    try{
        const payload = verifyToken(req)
        const userId = payload.id

        const user = await userModel.findById(userId).select('-password')
        if (!user){
            res.json({
                success: false,
                message: 'User not found'
            })
        }
        return res.json({
            success:true,
            message: "User found",
            user,
        })
    } catch (error){
        return res.json({
            success: false,
            message: "Error getting user",
            err: error.message
        })
}
}

//To test, place the token in Headers
//Update User
export const updateController = async (req, res) => {
    try {
        const payload = verifyToken(req)
        const userId = payload.id
        const {name, email} = req.body

        //Check if the user exists
        const user = await userModel.findById(userId)
        if (!user){
            res.json({
                success: false,
                message: 'User not found'
            })
        }

        //Update user fields 
        if (name) user.name = name
        if (email) user.email = email

        //Save the updatedUser
        await user.save()
        return res.json({
            success: true,
            message: 'User updated successfully',
            user: user
        })

    //Catch Error
    } catch (err) {
        return res.json({
            success: false,
            message: 'Error updating user',
            err: err
        })
    }
}

//Remove User
export const removeController = async (req, res) => {
    try{
        const payload = verifyToken(req)
        const userId = payload.id

        //Check if the user exists
        const user = await userModel.findById(userId)
        if (!user){
            res.json({
                success: false,
                message: 'User not found'
            })
        }

        //Delete the user
        await userModel.findByIdAndDelete(userId)
        return res.json({
            success: true,
            message: 'User Removed Successfully'
        })

    //Catch Error
    } catch (err){
        return res.json({
            success: false,
            message: 'Error removing user',
            err: err
        })
    }
}


//Google Login
export const googleLoginController = async(req,res) => {
    const { email, name, googleId } = req.body;

    if (!email || !googleId) {
        return res.json({
        success: false,
        message: 'Invalid Google login data',
        });
    }

    try {
        let user = await userModel.findOne({ email });

        // If user doesn't exist, register
        if (!user) {
        user = await userModel.create({
            name,
            email,
            password: await bcrypt.hash(googleId,10), 
            verified: true
        });
        }

        const token = createToken(user._id);

        return res.json({
        success: true,
        token,
        message: 'Logged in with Google successfully',
        });

    } catch (error) {
        return res.json({
        success: false,
        message: 'Google login failed',
        error: error.message,
        });
    }
}
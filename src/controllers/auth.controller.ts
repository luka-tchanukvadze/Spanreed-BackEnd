import { Request, Response } from "express"
import prisma from "../db/prisma.js"
import bcrypt from "bcryptjs"

export const signup = async(req:Request, res:Response) => {
  try {

    const {fullName, username, password, confirmPassword, gender} = req.body

    if(!fullName || !username || !password || !confirmPassword || !gender) {
      return res.status(400).json({error: 'Please fill in all fileds'})
    }

    if(password !== confirmPassword) {
      return res.status(400).json({error: "Passwords don't match"})
    }

    const user = await prisma.user.findUnique({ where: {username}})

    if(user) {
      return res.status(400).json({error: 'Username already exists'})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`

    const newUser = await prisma.user.create({
      data: {
        fullName, 
        username, 
        password: hashedPassword, 
        gender,
        profilePic: gender === 'male' ? boyProfilePic: girlProfilePic,
      }
    })

    if(newUser) {
      // generate toekn
      generateToken(newUser.id)

      res.status(201).json({
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        boyProfilePic: newUser.profilePic
      })
    } else{
      res.status(400).json({error: 'Invalid user data'})
    }
    
  } catch (error:any) {
    console.log("Error in signup controller",error.message)
    res.status(500).json({
      error: 'Internal Server Error'
    })
  }
}

export const login = async(req:Request, res:Response) => {

  
}

export const logout = async(req:Request, res:Response) => {}


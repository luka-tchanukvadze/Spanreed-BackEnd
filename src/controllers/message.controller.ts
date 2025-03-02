import { Request, Response } from "express";
import prisma from "../db/prisma.js";

export const sendMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { message } = req.body
    const { id: receiverId } = req.params
    const senderId = req.user.id
    
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantsIds: {
          hasEvery: [senderId, receiverId]
        }
      }
    })

    // the very first message is being send, that's why we need to create a converstion
    if(!conversation) { 
      conversation = await prisma.conversation.create({
        data: {
          participantsIds: {
            set: [senderId, receiverId]
          }
        }
      })
    }

    const newMesage = await prisma.message.create({
      data: {
        senderId,
        body: message,
        converationId: conversation.id
      }
    })

    if(newMesage) {
      conversation = await prisma.conversation.update({
        where: {
          id: conversation.id
        },
        data: {
          messages: {
            connect: {
              id: newMesage.id
            }
          }
        }
      })
    }

    // Socket io will go here
    res.status(201).json(newMesage)
  } catch (error: any) {
    console.error('Error in sendMessage: ', error.message)
    res.status(500).json({error: 'Internal sever error'})
  }
}

export const getMessages = async(req: Request, res: Response): Promise<any> => {
  try {
    const { id: userToChatId }
  } catch (error: any) {
    console.error('Error in getMessages: ', error.message)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
}
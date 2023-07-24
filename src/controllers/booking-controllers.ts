import bookingServices from "@/services/booking-service";
import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";

export async function getBooking (req: AuthenticatedRequest, res: Response) {
    const userId= req.userId

    try {
        const promise = await bookingServices.getBooking(userId)
        return res.status(httpStatus.OK).send(promise)
    } catch (err) {
        
        if (err.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND)
        } else {
            return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}

export async function createBooking ( req: AuthenticatedRequest, res: Response) {
    const userId = req.userId
    const {roomId} = req.body

    try {
        const promise = await bookingServices.createBooking(roomId, userId)

        if (promise === 403) {
            return res.sendStatus(403)
        } else {
            return res.status(200).send({bookingId: promise})
        }
    } catch(err) {
        if (err.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND)
        }
    }
}

export async function updateBooking ( req: AuthenticatedRequest, res: Response) {
    const userId = req.userId;
    const {roomId} = req.body;
    const booking = req.params;
    const bookingId= Number(booking.bookingId)

    try {
        const promise = await bookingServices.updateBooking(roomId, userId, bookingId)

        if( promise === 403) {
            return res.sendStatus(403)
        } else {
            return res.status(200).send(promise)
        }
    } catch (err) {
        if (err.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND)
        } else {
            return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
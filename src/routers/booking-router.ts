import { Router } from "express";
import { getBooking, updateBooking, createBooking } from "@/controllers";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { bookingSchema } from "@/schemas";

const bookingRouter = Router ();

bookingRouter.get('/', authenticateToken, getBooking)
bookingRouter.post('/', authenticateToken, validateBody(bookingSchema), createBooking)
bookingRouter.put('/:bookingId', authenticateToken, validateBody(bookingSchema) ,updateBooking)

export {bookingRouter}
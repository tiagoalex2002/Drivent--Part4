import bookingRepository from "@/repositories/booking-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import { notFoundError } from "@/errors";

export async function getBooking( user : number) {
    const result = await bookingRepository.getBookings(user)

    if ( !result) {
        throw notFoundError();
    } else {
        const room = await bookingRepository.getRoomById(result.roomId)
        const answer = {
            id : result.id,
            Room: room
        }

        return answer;
    }
}

export async function createBooking(room : number, user: number) {

    const roomExists = await bookingRepository.getRoomById(room)

    if ( !room || !roomExists) {
        throw notFoundError();
    } else {

        const enrollment = await enrollmentRepository.findWithAddressByUserId(user)
        const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id)
        const type = await ticketsRepository.findTickeWithTypeById(ticket.id)

        if ( ticket.status === "PAID" && type.TicketType.includesHotel === true && type.TicketType.isRemote === false) {
          const bookingsAmount= await bookingRepository.getBookingsByRoomId(room)
          if (bookingsAmount.length === roomExists.capacity) {
            return 403;
          } else {
            await bookingRepository.createBooking( room, user)
            const booking = await bookingRepository.getBookings(user)
            return booking.id;
          }
        } else {
           return 403;
        }
    }

}

export async function updateBooking (room : number, user: number, bookingId: number) {

    const roomExists = await bookingRepository.getRoomById(room)
    if ( !room || !roomExists) {
        throw notFoundError();
    } else {

        const booking = await bookingRepository.getBookings(user)

        const bookingsAmount= await bookingRepository.getBookingsByRoomId(room)
          if (bookingsAmount.length === roomExists.capacity) {
            return 403;
          } else {
            if (booking) {
                await bookingRepository.updateBooking( room, bookingId)
                return {bookingId};
            } else {
                return 403;
            }
          }
    
    }
}

const bookingServices = {
    getBooking,
    updateBooking,
    createBooking
}

export default bookingServices;
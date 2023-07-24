import bookingServices from "@/services/booking-service";
import httpStatus from "http-status";
import {
    createEnrollmentWithAddress,
    createHotel,
    createPayment,
    createRoomWithHotelId,
    createTicket,
    createTicketTypeRemote,
    createTicketTypeWithHotel,
    createUser,
    createBooking,
    createTicketTypeWithoutHotel
  } from '../factories';

  import bookingRepository from "@/repositories/booking-repository";
  import hotelRepository from "@/repositories/hotel-repository";
  import ticketsRepository from "@/repositories/tickets-repository";
  import enrollmentRepository from "@/repositories/enrollment-repository";




describe("Booking Services Unit Tests", () => {
  describe("GET /booking", () => {

    it("should return 401 when token is invalid")
  })
  })
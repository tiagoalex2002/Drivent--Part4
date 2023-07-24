import bookingServices from "@/services/booking-services";
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


beforeEach(() => {
    jest.clearAllMocks();
  });

  
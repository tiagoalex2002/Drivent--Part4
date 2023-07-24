import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import supertest from 'supertest';
import app, { init } from '@/app';
import { TicketStatus } from '.prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import * as jwt from 'jsonwebtoken';
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

beforeAll(async () => {
    await init();
  });
  
  beforeEach(async () => {
    await cleanDb();
  });
  
  const server = supertest(app);
  
  describe('GET /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/booking');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
  
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe('when token is valid', () => {
  
      it('should respond with status 404 when user does not have a reservation ', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
  
  
        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });
  
      it('should respond with status 200 and bookings info', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
  
        const createdHotel = await createHotel();
        const createdRoom = await createRoomWithHotelId(createdHotel.id);
        const createdBooking = await createBooking(user.id, createdRoom.id)
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.OK);
  
        expect(response.body).toEqual([
          {
            id: createdBooking.id,
            Room : {
                id: createdRoom.id,
                name: createdRoom.name,
                capacity: createdRoom.capacity,
                hotelId: createdHotel.id,
                createdAt: createdRoom.createdAt.toISOString(),
                updatedAt: createdRoom.updatedAt.toISOString(),
            }
          },
        ]);
      });
  
    });
  });
  
  describe('POST ', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.post('/booking');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe('when token is valid', () => {
      it('should respond with status 403 when user ticket is remote ', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
  
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(403);
      });

      it('should respond with status 403 when user ticket does not include a hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
  
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(403);
      });

      it('should respond with status 403 when the chosen room has full capacity', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);

        const createdHotel = await createHotel();
        await createRoomWithHotelId(createdHotel.id);
  
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(403);
      });

      it('should respond with status 403 when user ticket has not been paid ', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(403);
      });
  
      it('should respond with status 404 when chosen room does not exist ', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);

        await createHotel();
  
  
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });
  
  
      it('should respond with status 200 and booking id', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
  
        const createdHotel = await createHotel();
  
        const createdRoom = await createRoomWithHotelId(createdHotel.id);

        const booking = await createBooking(user.id, createdRoom.id)
  
        const response = await server.post(`/booking`).set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.OK);
  
        expect(response.body).toEqual({
          bookingId : booking.id
        });
      });
  
      });
    });


    describe('PUT /booking', () => {
        it('should respond with status 401 if no token is given', async () => {
          const response = await server.post('/booking');
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
      
        it('should respond with status 401 if given token is not valid', async () => {
          const token = faker.lorem.word();
      
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
      
        it('should respond with status 401 if there is no session for given token', async () => {
          const userWithoutSession = await createUser();
          const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      
          const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
      
        describe('when token is valid', () => {
    
    
          it('should respond with status 403 when the chosen room has full capacity', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
    
            const createdHotel = await createHotel();
            await createRoomWithHotelId(createdHotel.id);
      
            const response = await server.post('/booking/:bookingId').set('Authorization', `Bearer ${token}`);
      
            expect(response.status).toEqual(403);
          });
      
          it('should respond with status 404 when chosen room does not exist ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
    
            await createHotel();
      
      
            const response = await server.post('/booking/:bookingId').set('Authorization', `Bearer ${token}`);
      
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
          });

          it('should respond with status 404 when user does not have a reservation ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createEnrollmentWithAddress(user);
      
      
            const response = await server.get('/booking/:bookingId').set('Authorization', `Bearer ${token}`);
      
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
          });
      
      
          it('should respond with status 200 and booking id', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
      
            const createdHotel = await createHotel();
      
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
    
            const booking = await createBooking(user.id, createdRoom.id)
      
            const response = await server.post(`/booking/:bookingId`).set('Authorization', `Bearer ${token}`);
      
            expect(response.status).toEqual(httpStatus.OK);
      
            expect(response.body).toEqual({
              bookingId : booking.id
            });
          });
      
          });
        });
  
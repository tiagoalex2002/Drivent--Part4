import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createBooking( user: number, room: number) {
    return await prisma.booking.create({
        data: {
          userId: user,
          roomId: room
        },
      });
}
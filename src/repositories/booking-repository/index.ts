import { prisma } from "@/config";

async function getBookings( user : number) {
    return await prisma.booking.findFirst({where : { userId : user}, include : {Room : true}});
}

async function createBooking( room : number, user : number) {
    return  prisma.booking.create( {data : {roomId : room, userId: user}})
}

async function updateBooking(room : number, Id: number) {
    return await prisma.booking.update({ where : {id: Id}, data: { roomId: room}})
}

async function getBookingByRoomId( Id: number) {
    return await prisma.booking.findFirst( { where : {roomId: Id}})
}

async function getRoomById (Id: number) {
    return await prisma.room.findUnique({where : {id : Id}})
}


const bookingRepository = {
    getBookings,
    createBooking,
    updateBooking,
    getBookingByRoomId,
    getRoomById
}

export default bookingRepository;
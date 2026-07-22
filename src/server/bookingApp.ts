import express from "express";

export type Room = {
  id: number;
  name: string;
  pricePerNight: number;
  available: boolean;
};

export type Booking = {
  id: number;
  roomId: number;
  guestName: string;
  nights: number;
  total: number;
};

export const rooms: Room[] = [
  {
    id: 1,
    name: "Single Room",
    pricePerNight: 80,
    available: true,
  },
  {
    id: 2,
    name: "Double Room",
    pricePerNight: 120,
    available: true,
  },
];

export const bookings: Booking[] = [];

export const bookingApp = express();

bookingApp.use(express.json());

bookingApp.get("/api/rooms", (_request, response) => {
  return response.status(200).json(rooms);
});

bookingApp.post("/api/bookings", (request, response) => {
  const { roomId, guestName, nights } = request.body;

  const room = rooms.find((room) => room.id === roomId);

  if (!room) {
    return response.status(404).json({
      message: "Room not found",
    });
  }

  if (nights < 1 || !Number.isInteger(nights)) {
    return response.status(400).json({
      message: "Nights must be a positive integer",
    });
  }

  if(!room.available){
    return response.status(409).json({message:"Room is unavailable"})
  }
 
  if (!guestName.trim()) {
    return response.status(400).json({
      message: "Guest name is required",
    });
  }

  room.available = false;




  const booking: Booking = {
    id: bookings.length + 1,
    roomId,
    guestName,
    nights,
    total: room.pricePerNight * nights,
  };

  bookings.push(booking);

  return response.status(201).json(booking);
});
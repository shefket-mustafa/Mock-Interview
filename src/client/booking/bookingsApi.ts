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

export type CreateBookingInput = {
  roomId: number;
  guestName: string;
  nights: number;
};

export async function getRooms(): Promise<Room[]> {
  const response = await fetch("/api/rooms");

    if(!response.ok){
    throw new Error(`Failed to create booking`)
  }
  
  return response.json();
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<Booking> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if(!response.ok){
    throw new Error(`Failed to create booking`)
  }

  return response.json();
}
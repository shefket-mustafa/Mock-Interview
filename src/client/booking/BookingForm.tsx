import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  createBooking,
  getRooms,
  type Booking,
  type Room,
} from "./bookingsApi";

export function BookingForm() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState<number | null>(
    null,
  );
  const [guestName, setGuestName] = useState("");
  const [nights, setNights] = useState(1);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );
  const [booking, setBooking] =
    useState<Booking | null>(null);

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await getRooms();
        setRooms(data);
      } catch {
        setError("Failed to load rooms");
      }
    }

    loadRooms();
  }, []);

  const selectedRoom = rooms.find(
    (room) => room.id === roomId,
  );

  const total = selectedRoom
    ? selectedRoom.pricePerNight * nights
    : 0;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (roomId === null) {
      setError("Please select a room");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const createdBooking = await createBooking({
        roomId,
        guestName,
        nights,
      });

      setBooking(createdBooking);

      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          room.id === createdBooking.roomId
            ? {
                ...room,
                available: false,
              }
            : room,
        ),
      );
    } catch {
      setError("Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="room">Room</label>

        <select
          id="room"
          value={roomId ?? ""}
          onChange={(event) => {
            const value = event.target.value;

            setRoomId(value ? Number(value) : null);
          }}
        >
          <option value="">Select a room</option>

          {rooms.map((room) => (
            <option
              key={room.id}
              value={room.id}
              disabled={!room.available}
            >
              {room.name}
            </option>
          ))}
        </select>

        <label htmlFor="guest-name">Guest name</label>

        <input
          id="guest-name"
          value={guestName}
          onChange={(event) =>
            setGuestName(event.target.value)
          }
        />

        <label htmlFor="nights">Nights</label>

        <input
          id="nights"
          type="number"
          min={1}
          step={1}
          value={nights}
          onChange={(event) =>
            setNights(Number(event.target.value))
          }
        />

        <p>Total: €{total}</p>

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Booking..." : "Book room"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {booking && (
        <p>Booking confirmed: €{booking.total}</p>
      )}
    </div>
  );
}
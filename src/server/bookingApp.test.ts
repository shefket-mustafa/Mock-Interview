import request from "supertest";
import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  bookingApp,
  bookings,
  rooms,
} from "./bookingApp";

describe("booking API", () => {
  beforeEach(() => {
    bookings.length = 0;

    rooms[0].available = true;
    rooms[1].available = true;
  });

  it("returns all rooms", async () => {
    const response = await request(bookingApp).get(
      "/api/rooms",
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it("creates a booking and calculates its total", async () => {
    const response = await request(bookingApp)
      .post("/api/bookings")
      .send({
        roomId: 2,
        guestName: "Shefket Mustafa",
        nights: 3,
      });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      id: 1,
      roomId: 2,
      guestName: "Shefket Mustafa",
      nights: 3,
      total: 360,
    });

    expect(rooms[1].available).toBe(false);
    expect(bookings).toHaveLength(1);
  });

  it("rejects a guest name containing only whitespace", async () => {
    const response = await request(bookingApp)
      .post("/api/bookings")
      .send({
        roomId: 1,
        guestName: "   ",
        nights: 2,
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Guest name is required",
    });

    expect(rooms[0].available).toBe(true);
    expect(bookings).toHaveLength(0);
  });

  it("rejects a non-integer number of nights", async () => {
    const response = await request(bookingApp)
      .post("/api/bookings")
      .send({
        roomId: 1,
        guestName: "Anna",
        nights: 1.5,
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Nights must be a positive integer",
    });

    expect(rooms[0].available).toBe(true);
  });

  it("rejects nights supplied as a string", async () => {
    const response = await request(bookingApp)
      .post("/api/bookings")
      .send({
        roomId: 1,
        guestName: "Anna",
        nights: "2",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Nights must be a positive integer",
    });
  });

  it("returns 409 when the room is unavailable", async () => {
    rooms[0].available = false;

    const response = await request(bookingApp)
      .post("/api/bookings")
      .send({
        roomId: 1,
        guestName: "Anna",
        nights: 2,
      });

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      message: "Room is unavailable",
    });

    expect(bookings).toHaveLength(0);
  });

  it("does not modify a room when another field is invalid", async () => {
    const response = await request(bookingApp)
      .post("/api/bookings")
      .send({
        roomId: 1,
        guestName: "",
        nights: 2,
      });

    expect(response.status).toBe(400);
    expect(rooms[0].available).toBe(true);
  });
});
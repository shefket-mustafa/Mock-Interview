import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { BookingForm } from "./BookingForm";

const rooms = [
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

describe("BookingForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("loads rooms and calculates the total", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => rooms,
    } as Response);

    render(<BookingForm />);

    expect(
      await screen.findByRole("option", {
        name: "Double Room",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Room"),
      {
        target: {
          value: "2",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Nights"),
      {
        target: {
          value: "3",
        },
      },
    );

    expect(
      screen.getByText("Total: €360"),
    ).toBeInTheDocument();
  });

  it("submits numbers to the API and confirms the booking", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => rooms,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: 1,
          roomId: 2,
          guestName: "Shefket",
          nights: 3,
          total: 360,
        }),
      } as Response);

    render(<BookingForm />);

    await screen.findByRole("option", {
      name: "Double Room",
    });

    fireEvent.change(
      screen.getByLabelText("Room"),
      {
        target: {
          value: "2",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Guest name"),
      {
        target: {
          value: "Shefket",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Nights"),
      {
        target: {
          value: "3",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Book room",
      }),
    );

    expect(
      await screen.findByText(
        "Booking confirmed: €360",
      ),
    ).toBeInTheDocument();

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/bookings",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          roomId: 2,
          guestName: "Shefket",
          nights: 3,
        }),
      }),
    );

    expect(
      screen.getByRole("option", {
        name: "Double Room",
      }),
    ).toBeDisabled();
  });

  it("keeps the button disabled while booking is pending", async () => {
    let resolveBooking!: (
      response: Response,
    ) => void;

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => rooms,
      } as Response)
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveBooking = resolve;
          }),
      );

    render(<BookingForm />);

    await screen.findByRole("option", {
      name: "Single Room",
    });

    fireEvent.change(
      screen.getByLabelText("Room"),
      {
        target: {
          value: "1",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Guest name"),
      {
        target: {
          value: "Anna",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Book room",
      }),
    );

    const submittingButton = screen.getByRole(
      "button",
      {
        name: "Booking...",
      },
    );

    expect(submittingButton).toBeDisabled();

    resolveBooking({
      ok: true,
      status: 201,
      json: async () => ({
        id: 1,
        roomId: 1,
        guestName: "Anna",
        nights: 1,
        total: 80,
      }),
    } as Response);

    expect(
      await screen.findByText(
        "Booking confirmed: €80",
      ),
    ).toBeInTheDocument();
  });

  it("shows an error for an unsuccessful booking response", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => rooms,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          message: "Room is unavailable",
        }),
      } as Response);

    render(<BookingForm />);

    await screen.findByRole("option", {
      name: "Single Room",
    });

    fireEvent.change(
      screen.getByLabelText("Room"),
      {
        target: {
          value: "1",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Guest name"),
      {
        target: {
          value: "Anna",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Book room",
      }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Booking failed");
  });

  it("shows an error when loading rooms fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        message: "Server error",
      }),
    } as Response);

    render(<BookingForm />);

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Failed to load rooms");
  });
});
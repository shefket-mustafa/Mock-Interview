import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserSearch } from "./UserSearch";

describe("UserSearch", () => {
  it("debounces the request and renders matching users", async () => {
    const searchUsers = vi.fn().mockResolvedValue([
      { id: 1, name: "Anna" },
    ]);

    render(<UserSearch searchUsers={searchUsers} />);

    fireEvent.change(screen.getByLabelText("Search users"), {
      target: { value: "ann" },
    });

    expect(screen.getByText("Searching...")).toBeInTheDocument();
    expect(searchUsers).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(searchUsers).toHaveBeenCalledWith("ann");
    });

    expect(await screen.findByText("Anna")).toBeInTheDocument();
  });

  it("shows an error when the request fails", async () => {
    const searchUsers = vi
      .fn()
      .mockRejectedValue(new Error("Network error"));

    render(<UserSearch searchUsers={searchUsers} />);

    fireEvent.change(screen.getByLabelText("Search users"), {
      target: { value: "sam" },
    });

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Search failed");
  });
});
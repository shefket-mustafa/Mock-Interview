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
import { TaskManager } from "./TaskManager";

describe("TaskManager", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("loads tasks and completes a pending task", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 1,
            title: "Review pull request",
            completed: false,
          },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          title: "Review pull request",
          completed: true,
        }),
      } as Response);

    render(<TaskManager />);

    expect(
      screen.getByText("Loading tasks..."),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        "Review pull request — Pending",
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Complete",
      }),
    );

    expect(
      await screen.findByText(
        "Review pull request — Done",
      ),
    ).toBeInTheDocument();

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/tasks/1",
      expect.objectContaining({
        method: "PATCH",
      }),
    );
  });

  it("shows an error when loading returns HTTP 500", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        message: "Server error",
      }),
    } as Response);

    render(<TaskManager />);

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Failed to load tasks");
  });

  it("shows an error when completing returns HTTP 500", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 1,
            title: "Review pull request",
            completed: false,
          },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          message: "Server error",
        }),
      } as Response);

    render(<TaskManager />);

    await screen.findByText(
      "Review pull request — Pending",
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Complete",
      }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Failed to update task");
  });
});
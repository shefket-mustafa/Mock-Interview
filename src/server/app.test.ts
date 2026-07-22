import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, tasks } from "./app";

describe("tasks API", () => {
  beforeEach(() => {
    tasks[0].completed = false;
    tasks[1].completed = false;
  });

  it("returns all tasks", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it("completes an existing task", async () => {
    const response = await request(app)
      .patch("/api/tasks/1")
      .send({
        completed: true,
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      id: 1,
      title: "Review pull request",
      completed: true,
    });
  });

  it("returns 400 when completed is not a boolean", async () => {
    const response = await request(app)
      .patch("/api/tasks/1")
      .send({
        completed: "yes",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "completed must be a boolean",
    });
  });

  it("returns 400 when the task ID is invalid", async () => {
    const response = await request(app)
      .patch("/api/tasks/not-a-number")
      .send({
        completed: true,
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Invalid task ID",
    });
  });

  it("returns 404 when the task does not exist", async () => {
    const response = await request(app)
      .patch("/api/tasks/999")
      .send({
        completed: true,
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Task not found",
    });
  });
});
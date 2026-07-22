import express from "express";

export type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export const tasks: Task[] = [
  {
    id: 1,
    title: "Review pull request",
    completed: false,
  },
  {
    id: 2,
    title: "Run tests",
    completed: false,
  },
];

export const app = express();

app.use(express.json());

app.get("/api/tasks", (_request, response) => {
  return response.status(200).json(tasks);
});

app.patch("/api/tasks/:id", (request, response) => {
    const id = Number(request.params.id)

    if(Number.isNaN(id)){
        return response.status(400).json({
            message: "Invalid task ID"
        })
    }
  const task = tasks.find(
    (task) => task.id === id,
  );

  if (!task) {
    return response.status(404).json({
      message: "Task not found",
    });
  }

  if(typeof request.body.completed !== "boolean"){
    return response.status(400).json({message: "completed must be a boolean"})
  }

  task.completed = request.body.completed;

  return response.status(200).json(task);
});
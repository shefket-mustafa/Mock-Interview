export type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export async function getTasks(): Promise<Task[]> {
  const response = await fetch("/api/tasks");
  if(!response.ok){
    throw new Error(`Failed to load tasks: ${response.status}`)
  }

  return response.json();
}

export async function completeTask(
  taskId: number,
): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      completed: true,
    }),
  });

  if(!response.ok){
    throw new Error(`Failed to update task: ${response.status}`)
  }

  return response.json();
}
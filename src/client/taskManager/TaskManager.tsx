import { useEffect, useState } from "react";
import { completeTask, getTasks, Task } from "./tasksApi";


export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    async function fetchTasks(){
      try{
        setIsLoading(true);
        const data = await getTasks()
        setTasks(data);

      }catch{
        setError("Failed to load tasks");

      }finally {
        setIsLoading(false);
      }
      
    }

    fetchTasks()
  }, []);

  async function handleComplete(taskId: number) {
    try {
      const updatedTask = await completeTask(taskId);

    setTasks((currrentTasks) => 
    currrentTasks.map((task) => task.id === taskId ? {...task, completed: updatedTask.completed} : task))
    } catch {
      setError("Failed to update task");
    }
  }

  if (isLoading) {
    return <p>Loading tasks...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <span>
            {task.title} —{" "}
            {task.completed ? "Done" : "Pending"}
          </span>

          {!task.completed && (
            <button
              onClick={() => handleComplete(task.id)}
            >
              Complete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
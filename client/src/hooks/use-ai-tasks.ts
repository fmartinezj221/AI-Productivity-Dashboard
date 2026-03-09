import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useGenerateTasks() {
  return useMutation({
    mutationFn: async (goal: string) => {
      const payload = api.ai.generateTasks.input.parse({ goal });
      const res = await fetch(api.ai.generateTasks.path, {
        method: api.ai.generateTasks.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to generate tasks from AI");
      }
      return api.ai.generateTasks.responses[200].parse(await res.json());
    },
  });
}

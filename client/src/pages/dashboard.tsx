import { useState } from "react";
import { Plus, ListTodo, Columns } from "lucide-react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { TaskCard } from "@/components/ui/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppLayout } from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: tasks = [], isLoading } = useTasks();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await createMutation.mutateAsync({
        title: newTask.title,
        description: newTask.description || undefined,
      });
      setIsDialogOpen(false);
      setNewTask({ title: "", description: "" });
      toast({ title: "Task created successfully" });
    } catch (error) {
      toast({ title: "Failed to create task", variant: "destructive" });
    }
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const columns = [
    { id: "pending", title: "To Do", color: "bg-slate-500/10 border-slate-500/20 text-slate-700 dark:text-slate-300" },
    { id: "in_progress", title: "In Progress", color: "bg-primary/10 border-primary/20 text-primary" },
    { id: "completed", title: "Done", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 h-full pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Task Board</h1>
            <p className="text-muted-foreground mt-1">Organize and manage your workflow</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-md hover:shadow-lg transition-all">
                <Plus className="w-5 h-5 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Create a New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input
                    placeholder="E.g., Review Q3 Marketing Plan"
                    className="rounded-xl border-border/50 bg-background focus-visible:ring-primary/20 h-11"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                  <Textarea
                    placeholder="Add more details about this task..."
                    className="rounded-xl border-border/50 bg-background focus-visible:ring-primary/20 min-h-[100px] resize-none"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || !newTask.title.trim()}
                  className="rounded-xl h-11 w-full mt-2"
                >
                  {createMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse-slow p-4 bg-muted rounded-full">
              <Columns className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto border-2 border-dashed border-border/50 rounded-3xl p-12 bg-card/50">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <ListTodo className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You have a clean slate! Create your first task to get started, or use the AI Goal Breakdown to generate a plan.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="rounded-xl px-6">
              Create First Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className="flex flex-col gap-4">
                  <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${col.color}`}>
                    <h3 className="font-semibold text-sm tracking-wide uppercase">
                      {col.title}
                    </h3>
                    <span className="text-xs font-bold py-0.5 px-2 bg-background/50 rounded-md">
                      {colTasks.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 min-h-[150px]">
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

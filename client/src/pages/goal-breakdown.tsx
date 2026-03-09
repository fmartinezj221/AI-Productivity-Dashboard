import { useState } from "react";
import { Sparkles, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateTasks } from "@/hooks/use-ai-tasks";
import { useCreateTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function GoalBreakdown() {
  const [goal, setGoal] = useState("");
  const [addedTasks, setAddedTasks] = useState<Set<number>>(new Set());
  
  const generateMutation = useGenerateTasks();
  const createTaskMutation = useCreateTask();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!goal.trim()) return;
    setAddedTasks(new Set());
    generateMutation.mutate(goal);
  };

  const handleAddTask = async (task: { title: string; description?: string }, index: number) => {
    try {
      await createTaskMutation.mutateAsync(task);
      setAddedTasks((prev) => new Set(prev).add(index));
      toast({ title: "Task added to dashboard!" });
    } catch (error) {
      toast({ title: "Failed to add task", variant: "destructive" });
    }
  };

  const handleAddAll = async () => {
    const tasks = generateMutation.data?.tasks || [];
    let successCount = 0;
    
    for (let i = 0; i < tasks.length; i++) {
      if (!addedTasks.has(i)) {
        try {
          await createTaskMutation.mutateAsync(tasks[i]);
          setAddedTasks((prev) => new Set(prev).add(i));
          successCount++;
        } catch (error) {
          console.error("Failed to add task", error);
        }
      }
    }
    if (successCount > 0) {
      toast({ title: `Added ${successCount} tasks to your board!` });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12">
        <div className="text-center mt-8 mb-4">
          <div className="mx-auto w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
            <Target className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">AI Goal Breakdown</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Have a large goal? Let our AI analyze it and break it down into actionable, bite-sized tasks.
          </p>
        </div>

        <div className="bg-card border border-border shadow-xl shadow-black/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <Textarea
            placeholder="Describe what you want to achieve... (e.g., 'Launch a new personal blog by next month')"
            className="text-lg resize-none min-h-[120px] bg-transparent border-0 focus-visible:ring-0 p-0 placeholder:text-muted-foreground/60"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          
          <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
            <Button 
              size="lg" 
              className="rounded-xl px-8 shadow-md shadow-primary/20 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              onClick={handleGenerate}
              disabled={!goal.trim() || generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing Goal...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Break It Down
                </>
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {generateMutation.isPending && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 mt-8"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-card rounded-2xl border border-border/50 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </motion.div>
          )}

          {generateMutation.data?.tasks && !generateMutation.isPending && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 mt-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-bold">Recommended Action Plan</h3>
                {addedTasks.size < generateMutation.data.tasks.length && (
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={handleAddAll}>
                    Add All to Board
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                {generateMutation.data.tasks.map((task, index) => {
                  const isAdded = addedTasks.has(index);
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={index}
                      className="group flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{task.title}</h4>
                          {task.description && (
                            <p className="text-muted-foreground mt-1">{task.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant={isAdded ? "secondary" : "default"}
                        className={`rounded-xl shrink-0 ${isAdded ? 'text-emerald-600 bg-emerald-500/10' : ''}`}
                        onClick={() => handleAddTask(task, index)}
                        disabled={isAdded || createTaskMutation.isPending}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Added
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Add Task
                          </>
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

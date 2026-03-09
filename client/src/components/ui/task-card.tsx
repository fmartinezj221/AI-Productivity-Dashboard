import { motion } from "framer-motion";
import { Trash2, Clock, CheckCircle2, CircleDashed, MoreVertical, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

const statusConfig = {
  pending: { icon: CircleDashed, color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-200 dark:border-slate-800" },
  in_progress: { icon: Clock, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
} as const;

export function TaskCard({ task, onUpdateStatus, onDelete }: TaskCardProps) {
  const config = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative flex flex-col gap-3 p-4 rounded-2xl bg-card border ${config.border} shadow-sm card-hover`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-0.5 shrink-0 p-2 rounded-xl ${config.bg} ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h4 className={`font-semibold text-base leading-tight truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                {task.description}
              </p>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            {task.status !== "pending" && (
              <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "pending")}>
                <CircleDashed className="w-4 h-4 mr-2" /> Mark as Pending
              </DropdownMenuItem>
            )}
            {task.status !== "in_progress" && (
              <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "in_progress")}>
                <Clock className="w-4 h-4 mr-2" /> Mark in Progress
              </DropdownMenuItem>
            )}
            {task.status !== "completed" && (
              <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "completed")}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs font-medium text-muted-foreground/70">
          {task.createdAt ? format(new Date(task.createdAt), "MMM d, yyyy") : "Just now"}
        </span>
        
        {/* Quick action button based on current status */}
        {task.status === "pending" && (
          <Button size="sm" variant="secondary" className="h-7 text-xs rounded-lg px-3" onClick={() => onUpdateStatus(task.id, "in_progress")}>
            Start
          </Button>
        )}
        {task.status === "in_progress" && (
          <Button size="sm" className="h-7 text-xs rounded-lg px-3 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => onUpdateStatus(task.id, "completed")}>
            Complete
          </Button>
        )}
      </div>
    </motion.div>
  );
}

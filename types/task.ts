export interface Task {
  id: string;
  title: string;
  startTime: Date;
  durationMin: number;
  color?: string;
  completed?: boolean;
  notes?: string;
}

export const getTaskEndTime = (task: Task): Date => {
  return new Date(task.startTime.getTime() + task.durationMin * 60000);
};

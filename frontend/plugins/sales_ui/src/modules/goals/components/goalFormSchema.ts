import { z } from "zod";

const specificPeriodGoalSchema = z.object({
  _id: z.string(),
  progress: z.string(),
  current: z.string(),
  addMonthly: z.string(),
  addTarget: z.number(),
});

export const goalFormSchema = z.object({
  // Basic info
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required").default(""),
  entity: z.string().min(1, "Entity is required").default("deal"),
  
  // Pipeline/Board/Stage
  stageId: z.string().nullable().optional(),
  stageName: z.string().optional(),
  pipelineId: z.string().nullable().optional(),
  boardId: z.string().nullable().optional(),
  
  // Goal configuration
  contributionType: z.string().default("person"),
  metric: z.string().default("Value"),
  goalTypeChoose: z.string().default("Added"),
  
  // Arrays for multi-select fields
  contribution: z.array(z.string()).default([]),
  department: z.array(z.string()).default([]),
  unit: z.array(z.string()).default([]),
  branch: z.array(z.string()).default([]),
  segmentIds: z.array(z.string()).default([]),
  productIds: z.array(z.string()).default([]),
  companyIds: z.array(z.string()).default([]),
  tagsIds: z.array(z.string()).default([]),
  
  // Specific period goals
  specificPeriodGoals: z.array(specificPeriodGoalSchema).default([]),
  
  // Dates
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  
  // Radio toggles
  stageRadio: z.boolean().default(false),
  segmentRadio: z.boolean().default(false),
  
  // Period goal
  periodGoal: z.string().default("Monthly"),
  
  // Team goal type
  teamGoalType: z.string().default(""),
  
  // Segment count
  segmentCount: z.number().default(0),
  
  // Pipeline labels
  pipelineLabels: z.array(z.any()).default([]),
  selectedLabelIds: z.array(z.string()).default([]),
  
  // Additional fields
  chooseStage: z.string().optional(),
  period: z.string().optional(),
});

export type GoalFormType = z.infer<typeof goalFormSchema>;


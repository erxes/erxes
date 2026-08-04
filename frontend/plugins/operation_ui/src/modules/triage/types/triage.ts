import { z } from 'zod';

export interface ITriage {
  _id: string;
  name: string;
  description: string;
  teamId: string;
  createdBy: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  priority: number;
  status: number;
}

export interface IAddTriage {
  name: string;
  description: string;
  teamId: string;
  priority: number;
  status: number;
}

export const addTriageSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  teamId: z.string().min(1),
  priority: z.number().optional(),
  status: z.number().optional(),
});

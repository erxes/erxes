import { TFilesRole } from '../types';

const RANK: Record<TFilesRole, number> = {
  viewer: 1,
  contributor: 2,
  manager: 3,
};

// The server enforces these; the UI only hides what would be refused.
export const filesCanContribute = (role?: TFilesRole | null) =>
  !!role && RANK[role] >= RANK.contributor;

export const filesCanManage = (role?: TFilesRole | null) => role === 'manager';

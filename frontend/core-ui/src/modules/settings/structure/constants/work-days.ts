import { IWorkDay, WorkDay } from '@/settings/structure/types/workhours';
import { parse } from 'date-fns';

type Workhours = Partial<Record<WorkDay, IWorkDay>>;

export const workingHours: Workhours = {
  Monday: {
    inactive: true,
    startFrom: '09:00',
    endTo: '18:00',
    lunchStartFrom: '12:00',
    lunchEndTo: '13:00',
  },
  Tuesday: {
    inactive: true,
    startFrom: '09:00',
    endTo: '18:00',
    lunchStartFrom: '12:00',
    lunchEndTo: '13:00',
  },
  Wednesday: {
    inactive: true,
    startFrom: '09:00',
    endTo: '18:00',
    lunchStartFrom: '12:00',
    lunchEndTo: '13:00',
  },
  Thursday: {
    inactive: true,
    startFrom: '09:00',
    endTo: '18:00',
    lunchStartFrom: '12:00',
    lunchEndTo: '13:00',
  },
  Friday: {
    inactive: true,
    startFrom: '09:00',
    endTo: '18:00',
    lunchStartFrom: '12:00',
    lunchEndTo: '13:00',
  },
  Saturday: {
    inactive: true,
    startFrom: '10:00',
    endTo: '10:00',
    lunchStartFrom: '12:00',
    lunchEndTo: '13:00',
  },
  Sunday: {
    inactive: true,
    startFrom: '10:00',
    endTo: '10:00',
    lunchStartFrom: '12:00',
    lunchEndTo: '13:00',
  },
};

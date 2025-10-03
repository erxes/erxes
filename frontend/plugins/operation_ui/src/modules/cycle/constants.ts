export const CYCLES_CURSOR_SESSION_KEY = 'cycles_cursor_session_key';

export const STATUS_COLORS = {
  started: 'hsl(var(--warning))', // in progress
  completed: 'hsl(var(--success))', // done
  totalScope: 'hsl(var(--primary))', // backlog буюу жишээ өнгө
};

export const CHART_CONFIG = {
  started: {
    label: 'Started',
    color: STATUS_COLORS.started,
  },
  completed: {
    label: 'Completed',
    color: STATUS_COLORS.completed,
  },
};

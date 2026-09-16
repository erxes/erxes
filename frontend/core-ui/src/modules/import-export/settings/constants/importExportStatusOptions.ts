import {
  IconCircleCheck,
  IconCircleX,
  IconClockPause,
  IconFileCheck,
  IconLoader,
  IconProgressAlert,
} from '@tabler/icons-react';

export const IMPORT_EXPORT_STATUS_OPTIONS = [
  { value: 'pending', labelKey: 'status-pending', icon: IconClockPause },
  { value: 'validating', labelKey: 'status-validating', icon: IconFileCheck },
  { value: 'processing', labelKey: 'status-processing', icon: IconLoader },
  { value: 'completed', labelKey: 'status-completed', icon: IconCircleCheck },
  { value: 'failed', labelKey: 'status-failed', icon: IconProgressAlert },
  { value: 'cancelled', labelKey: 'status-cancelled', icon: IconCircleX },
] as const;

export const IMPORT_HISTORIES_CURSOR_SESSION_KEY = 'import_histories_cursor';
export const EXPORT_HISTORIES_CURSOR_SESSION_KEY = 'export_histories_cursor';

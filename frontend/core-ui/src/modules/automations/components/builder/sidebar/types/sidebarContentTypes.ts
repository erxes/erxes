import { NodeData } from '@/automations/types';

/**
 * Props for automation trigger content components
 */
export interface AutomationTriggerContentProps {
  /** The active automation node data */
  activeNode: NodeData;
}

/**
 * Props for the trigger content wrapper component
 */
export interface TriggerContentWrapperProps {
  /** Content to render in the main area */
  children: React.ReactNode;
  /** Footer content with actions */
  footer: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Accessibility label for the wrapper */
  'aria-label'?: string;
}

/**
 * Props for custom core trigger content component
 */
export interface CustomCoreTriggerContentProps
  extends AutomationTriggerContentProps {
  /** The module name for the core trigger */
  moduleName: string;
}

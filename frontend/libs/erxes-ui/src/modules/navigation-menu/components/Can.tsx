import { usePermissionContext } from '../contexts/PermissionContext';

interface CanProps {
  /** Specific action to check, e.g. 'taskCreate', 'taskRemove' */
  action?: string;
  /** Module-level check, e.g. 'task', 'project' */
  module?: string;
  /** Content to render when the user HAS the permission */
  children: React.ReactNode;
  /** Optional fallback when the user does NOT have the permission */
  fallback?: React.ReactNode;
}

/**
 * Declarative permission check component.
 *
 * Usage:
 *   // Hide a button if user can't delete tasks
 *   <Can action="taskRemove">
 *     <Button onClick={handleDelete}>Delete</Button>
 *   </Can>
 *
 *   // Show disabled state instead of hiding
 *   <Can action="taskCreate" fallback={<Button disabled>Create</Button>}>
 *     <Button onClick={handleCreate}>Create</Button>
 *   </Can>
 *
 *   // Module-level check (same as PermissionGuard but lighter)
 *   <Can module="task">
 *     <TaskList />
 *   </Can>
 */
export const Can = ({ action, module, children, fallback = null }: CanProps) => {
  const { can, canAction } = usePermissionContext();

  let allowed = true;

  if (action) {
    allowed = canAction(action);
  } else if (module) {
    allowed = can(module);
  }

  if (!allowed) {
    return fallback as React.ReactElement | null;
  }

  return children as React.ReactElement;
};

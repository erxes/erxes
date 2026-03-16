import { usePermissionContext, PermissionScope } from '../contexts/PermissionContext';

/**
 * Primary hook for checking permissions throughout the app.
 *
 * Usage:
 *   const { can, canAction, getScope } = usePermissions();
 *
 *   // Module-level (navigation, route guards)
 *   can('task')          // true if user has any read access to task module
 *
 *   // Action-level (buttons, forms)
 *   canAction('taskCreate')   // true if user can create tasks
 *   canAction('taskRemove')   // true if user can delete tasks
 *
 *   // Scope-level (filter data)
 *   getScope('task')     // 'own' | 'group' | 'all' | null
 */
export const usePermissions = (): {
  can: (name: string) => boolean;
  canAction: (action: string) => boolean;
  getScope: (module: string) => PermissionScope | null;
  loading: boolean;
} => {
  return usePermissionContext();
};

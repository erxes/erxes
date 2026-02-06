import { useGetPermissionModules } from '@/settings/permissions/hooks/useGetPermissionModules';
import { UseFormReturn } from 'react-hook-form';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { Sidebar } from 'erxes-ui';

export const PermissionModulesForm = ({
  form,
}: {
  form: UseFormReturn<IPermissionGroupSchema>;
}) => {
  const { permissionModulesByPlugin } = useGetPermissionModules();

  return (
    <div className="flex-auto flex h-full">
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Plugins</Sidebar.GroupLabel>
          <Sidebar.GroupContent className="mt-2">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>dadsa</Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>
      <div className="flex-1">dads</div>
    </div>
  );
};

import { useTranslation } from 'react-i18next';
import {
  IconDots,
  IconEdit,
  IconEye,
  IconPlus,
  IconRestore,
  IconTemplate,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  DropdownMenu,
  Spinner,
  Table,
  TextOverflowTooltip,
  toast,
  useConfirm,
} from 'erxes-ui';
import {
  useGetPermissionDefaultGroups,
  useGetPermissionGroups,
} from '@/settings/permissions/hooks/useGetPermissionGroups';
import { IPermissionGroup } from '@/settings/permissions/types';
import { PermissionGroupAdd } from '@/settings/permissions/components/form/PermissionGroupAdd';
import { useRemovePermissionGroup } from '@/settings/permissions/hooks/useRemovePermissionGroup';
import { useResetPermissionGroupToTemplate } from '@/settings/permissions/hooks/useResetPermissionGroupToTemplate';
import { PermissionGroupEdit } from './form/PermissionGroupEdit';
import { PermissionGroupDetails } from './PermissionGroupDetails';
import { groupPermissionGroupsByPlugin } from '@/settings/permissions/utils/groupPermissionGroups';
import { Can } from 'ui-modules';

export const PermissionGroups = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const { permissionGroups, loading } = useGetPermissionGroups();

  if (loading) {
    return (
      <div className="m-3">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>{t('name')}</Table.Head>
                <Table.Head>{t('description')}</Table.Head>
                <Table.Head className="w-12"></Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row className="hover:bg-background">
                <Table.Cell
                  colSpan={3}
                  className="h-auto py-12 group-hover/table-row:bg-background border-none"
                >
                  <Spinner />
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </div>
    );
  }

  const { pluginGroups, customGroups } =
    groupPermissionGroupsByPlugin(permissionGroups);

  return (
    <div className="m-3">
      <div className="max-w-lg mx-auto flex flex-col gap-2">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('name')}</Table.Head>
              <Table.Head>{t('description')}</Table.Head>
              <Table.Head className="w-12"></Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>

        {Object.entries(pluginGroups).map(([plugin, groups]) => (
          <Collapsible className="group" defaultOpen key={plugin}>
            <div className="relative">
              <Collapsible.Trigger asChild>
                <Button variant="secondary" className="w-full justify-start">
                  <Collapsible.TriggerIcon />
                  <span className="flex items-center gap-2">
                    {t('plugin-name', { plugin })}
                  </span>
                </Button>
              </Collapsible.Trigger>
            </div>
            <Collapsible.Content className="pt-2">
              <PermissionGroupRows groups={groups} />
            </Collapsible.Content>
          </Collapsible>
        ))}

        <Collapsible className="group" defaultOpen>
          <div className="relative">
            <Collapsible.Trigger asChild>
              <Button variant="secondary" className="w-full justify-start">
                <Collapsible.TriggerIcon />
                <span className="flex items-center gap-2">
                  {t('custom-groups')}
                </span>
              </Button>
            </Collapsible.Trigger>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
              <Can action="permissionsManage">
                <>
                  <PermissionTemplateAdd />
                  <PermissionGroupAdd
                    text=""
                    trigger={
                      <Button variant="ghost" size="icon" className="size-7">
                        <IconPlus size={16} />
                      </Button>
                    }
                  />
                </>
              </Can>
            </div>
          </div>
          <Collapsible.Content className="pt-2">
            {customGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">
                  {t('no-custom-groups-yet')}
                </p>
                <Can action="permissionsManage">
                  <PermissionGroupAdd />
                </Can>
              </div>
            ) : (
              <PermissionGroupRows groups={customGroups} />
            )}
          </Collapsible.Content>
        </Collapsible>
      </div>
    </div>
  );
};

const PermissionGroupRows = ({ groups }: { groups: IPermissionGroup[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });

  return (
    <Table className="[&_tr_td]:border-b-0 [&_tr_td:first-child]:border-l-0 [&_tr_td]:border-r-0">
      <Table.Body>
        {groups.map((group) => (
          <Table.Row className="hover:bg-sidebar" key={group._id}>
            <Table.Cell>
              <TextOverflowTooltip
                value={group.name}
                className="block font-medium"
              />
            </Table.Cell>
            <Table.Cell>
              <TextOverflowTooltip
                value={group.description || t('no-description')}
                className="block text-muted-foreground"
              />
            </Table.Cell>
            <Table.Cell className="w-8 p-0.5">
              <PermissionGroupDropdown group={group} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const PermissionTemplateAdd = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const { defaultGroups, loading } = useGetPermissionDefaultGroups();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={loading || !defaultGroups.length}
        >
          <IconTemplate size={16} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="min-w-56 max-h-80 overflow-y-auto">
        <DropdownMenu.Label>{t('from-template')}</DropdownMenu.Label>
        {defaultGroups.map((template) => (
          <PermissionGroupAdd
            key={template.id}
            defaultValues={{
              name: template.name,
              description: template.description || '',
              permissions: template.permissions,
            }}
            trigger={
              <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
                {template.name}
              </DropdownMenu.Item>
            }
          />
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const PermissionGroupDropdown = ({ group }: { group: IPermissionGroup }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const { confirm } = useConfirm();
  const { removePermissionGroup } = useRemovePermissionGroup();
  const { resetPermissionGroupToTemplate } =
    useResetPermissionGroupToTemplate();

  const removeGroup = () => {
    removePermissionGroup({
      variables: { _id: group._id },
      onCompleted: () => {
        toast({ title: t('group-deleted'), variant: 'success' });
      },
      onError: (error) => {
        toast({
          title: t('error-deleting-group'),
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  };

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-group', { name: group.name }),
    }).then(removeGroup);
  };

  const handleReset = () => {
    confirm({
      message: t('confirm-reset-group', { name: group.name }),
    }).then(() => {
      resetPermissionGroupToTemplate({
        variables: { _id: group._id },
        onCompleted: () => {
          toast({ title: t('group-reset'), variant: 'success' });
        },
        onError: (error) => {
          toast({
            title: t('error-resetting-group'),
            variant: 'destructive',
            description: error.message,
          });
        },
      });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground size-7"
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="min-w-48">
        <PermissionGroupDetails
          group={group}
          isDefault={false}
          trigger={
            <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
              <IconEye size={16} />
              {t('view')}
            </DropdownMenu.Item>
          }
        />
        <Can action="permissionsManage">
          <>
            <PermissionGroupEdit
              group={group}
              trigger={
                <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
                  <IconEdit size={16} />
                  {t('edit')}
                </DropdownMenu.Item>
              }
            />
            {group.templateId && (
              <DropdownMenu.Item onClick={handleReset}>
                <IconRestore size={16} />
                {t('reset-to-template')}
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              className="text-destructive"
              onClick={handleDelete}
            >
              <IconTrash size={16} />
              {t('delete')}
            </DropdownMenu.Item>
          </>
        </Can>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

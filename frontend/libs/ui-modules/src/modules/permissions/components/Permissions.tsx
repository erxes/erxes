import {
  IconChecks,
  IconPlus,
  IconTool,
  IconUser,
  IconUserCog,
} from '@tabler/icons-react';
import {
  RecordTable,
  Sidebar,
  useQueryState,
  Collapsible,
  Filter,
  Combobox,
  Command,
  PageSubHeader,
  Skeleton,
  Popover,
  useFilterQueryState,
  useSetHotkeyScope,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useToast,
  Sheet,
  Button,
  Form,
  Spinner,
  Kbd,
  Badge,
  toast,
  Switch,
  useMultiQueryState,
  useFilterContext,
} from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { permissionColumns } from 'ui-modules/modules/permissions/components/permission-columns';
import { PERMISSION_CURSOR_SESSION_KEY } from 'ui-modules/modules/permissions/constants/permissionCursorSessionKey';
import { usePermissions } from 'ui-modules/modules/permissions/hooks/usePermissions';
import { IconChevronDown } from '@tabler/icons-react';
import {
  IPermissionFormSchema,
  PermissionsFilterScope,
  PermissionsScope,
} from 'ui-modules/modules/permissions/types/permission';
import {
  SelectMember,
  SelectUsersGroup,
} from 'ui-modules/modules/team-members';
import React, { useEffect, useState } from 'react';
import { usePermissionsForm } from 'ui-modules/modules/permissions/hooks/usePermissionsForm';
import {
  usePermissionsAdd,
  usePermissionsFix,
  usePermissionsRemove,
} from 'ui-modules/modules/permissions/hooks/usePermissionsMutations';
import { SubmitHandler, useFormContext } from 'react-hook-form';
import { SelectModule } from 'ui-modules/modules/permissions/components/SelectModule';
import { AnimatePresence, motion } from 'framer-motion';
import { SelectActions } from 'ui-modules/modules/permissions/components/SelectActions';
import { PermissionsCommandBar } from 'ui-modules/modules/permissions/components/permissions-commandbar';

export const PermissionsSidebarItem = ({
  to,
  children,
  asChild,
}: {
  to: string;
  children?: React.ReactNode;
  asChild?: boolean;
}) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  const isSubItemActive = !isActive && pathname.includes('module=');
  const shouldShowCaret = isSubItemActive && !isActive;
  const isIconActive = isActive || (isSubItemActive && isActive);
  return (
    <Sidebar.MenuItem>
      <Link to={to}>
        <Sidebar.MenuButton
          className="flex items-center justify-between capitalize"
          isActive={isIconActive}
        >
          permissions
          {shouldShowCaret && <IconChevronDown />}
        </Sidebar.MenuButton>
      </Link>
      {asChild && (
        <Collapsible.Content>
          <Sidebar.GroupContent className="pt-2">
            <Sidebar.Sub>{children}</Sidebar.Sub>
          </Sidebar.GroupContent>
        </Collapsible.Content>
      )}
    </Sidebar.MenuItem>
  );
};

export const PermissionsSidebarSubItem = ({
  path,
  label,
}: {
  path: string;
  label: string;
}) => {
  const [module] = useQueryState<string>('module');
  const isActive = module === label;
  return (
    <Sidebar.SubItem key={path}>
      <Link to={path}>
        <Sidebar.SubButton className="capitalize" isActive={isActive}>
          {label}
        </Sidebar.SubButton>
      </Link>
    </Sidebar.SubItem>
  );
};

export const PermissionsSidebarGroup = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { pathname } = useLocation();
  return (
    <Sidebar.Group>
      <Sidebar.Menu>
        <Collapsible
          defaultOpen
          open={pathname.includes('permissions')}
          className="group/collapsible"
        >
          {children}
        </Collapsible>
      </Sidebar.Menu>
    </Sidebar.Group>
  );
};

export const PermissionsRecordTable = ({ module }: { module?: string }) => {
  const [{ module: moduleName, action, userId, allowed }] = useMultiQueryState<{
    module: string;
    action: string;
    userId: string;
    allowed: 'allowed' | 'notAllowed';
  }>(['module', 'action', 'userId', 'allowed']);
  const selectedModule = moduleName || module;
  const isAllowed = !allowed || allowed === 'allowed';

  const { handleFetchMore, permissions, loading, error, pageInfo } =
    usePermissions({
      variables: {
        module: selectedModule ?? undefined,
        action: action ?? undefined,
        userId: userId ?? undefined,
        allowed: isAllowed ?? undefined,
      },
    });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (error) {
    return (
      <div className="text-destructive">
        Error loading permissions: {error.message}
      </div>
    );
  }

  return (
    <RecordTable.Provider
      columns={permissionColumns}
      data={permissions || []}
      stickyColumns={['more', 'checkbox', 'module']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={permissions?.length}
        sessionKey={PERMISSION_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
          <PermissionsCommandBar />
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

export const PermissionsView = ({
  module,
  shouldHide,
}: {
  module?: string;
  shouldHide?: boolean;
}) => {
  const [moduleName] = useQueryState<string>('module');

  return (
    <div className="flex flex-auto w-full overflow-hidden">
      <div className="w-full overflow-hidden flex flex-col">
        <PageSubHeader>
          <PermissionsFilter
            module={moduleName || module}
            shouldHide={shouldHide}
          />
        </PageSubHeader>
        <PermissionsRecordTable module={moduleName || module} />
      </div>
    </div>
  );
};

const IsAllowed = () => {
  const [allowed, setAllowed] = useQueryState<string>('allowed');
  const { resetFilterState } = useFilterContext();

  const isAllowed = !allowed || allowed === 'allowed';

  const handleToggle = (value: boolean) => {
    const nextValue = !isAllowed;
    setAllowed(nextValue ? 'allowed' : 'notAllowed');
    resetFilterState();
  };

  return (
    <div className="flex items-center justify-center ml-auto">
      <Switch checked={isAllowed} onCheckedChange={handleToggle} />
    </div>
  );
};

export const PermissionsFilter = ({
  module,
  shouldHide = true,
}: {
  module?: string;
  shouldHide?: boolean;
}) => {
  const [groupId] = useFilterQueryState<string>('groupId');
  const [{ module: moduleName, userId }] = useMultiQueryState<{
    module: string;
    userId: string;
  }>(['module', 'userId']);
  return (
    <Filter id="permissions-filter">
      <Filter.Bar>
        <Filter.Popover scope={PermissionsFilterScope.FilterBar}>
          <Filter.Trigger />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput />
                <Command.List>
                  <Filter.SearchValueTrigger />
                  {!shouldHide && <SelectModule.FilterItem />}

                  <Filter.Item value="userId">
                    <IconUser />
                    Choose users
                  </Filter.Item>

                  <Command.Item className="flex items-center gap-1">
                    <IconChecks />
                    Granted:
                    <IsAllowed />
                  </Command.Item>
                </Command.List>
              </Command>
            </Filter.View>
            {!shouldHide && <SelectModule.FilterView />}
            <SelectMember.FilterView queryKey="userId" />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        {!shouldHide && !!moduleName && <SelectModule.BarItem />}
        <SelectActions.BarItem />
        {!!groupId && <SelectUsersGroup.FilterBar />}
        {!!userId && <SelectMember.FilterBar queryKey="userId" iconOnly />}
        <PermissionsTotalCount module={module ? module : moduleName} />
      </Filter.Bar>
    </Filter>
  );
};

export const PermissionsTotalCount = ({
  module,
}: {
  module?: string | null;
}) => {
  const [{ action, userId, allowed }] = useMultiQueryState<{
    action: string;
    userId: string;
    allowed: 'allowed' | 'notAllowed';
  }>(['action', 'userId', 'allowed']);
  const isAllowed = !allowed || allowed === 'allowed';
  const { totalCount, loading } = usePermissions({
    variables: {
      module: module ?? undefined,
      action: action ?? undefined,
      userId: userId ?? undefined,
      allowed: isAllowed ?? undefined,
    },
  });
  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {loading ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : totalCount !== null && totalCount !== undefined ? (
        totalCount > 0 ? (
          `${totalCount} records found`
        ) : (
          'No records found'
        )
      ) : null}
    </div>
  );
};

export const PermissionsCreate = ({ module }: { module?: string }) => {
  const [open, setOpen] = useState<boolean>(false);
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { permissionsAdd, loading } = usePermissionsAdd();

  const { toast } = useToast();

  const {
    form,
    form: { handleSubmit, reset },
  } = usePermissionsForm();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(PermissionsScope.Create);
  };

  const onClose = () => {
    setHotkeyScope(PermissionsScope.Page);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), PermissionsScope.Page);
  useScopedHotkeys(`esc`, () => onClose(), PermissionsScope.Create);

  const submitHandler: SubmitHandler<IPermissionFormSchema> = React.useCallback(
    async (data) => {
      permissionsAdd({
        variables: data,
        onCompleted: () => {
          toast({ title: 'Success!' });
          reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [permissionsAdd],
  );

  return (
    <Sheet onOpenChange={(open) => (open ? onOpen() : onClose())} open={open}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          New Permission
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <Sheet.Header>
              <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
                <IconUserCog size={16} />
                New permission
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <PermissionForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};

export const PermissionForm = () => {
  const { control, setValue, watch } = useFormContext<IPermissionFormSchema>();

  const [{ groupId, module: moduleName }] = useMultiQueryState<{
    groupId: string;
    module: string;
  }>(['groupId', 'module']);

  const module = watch('module');

  useEffect(() => {
    if (moduleName) {
      setValue('module', moduleName);
    }
  }, []);

  useEffect(() => {
    if (groupId) {
      setValue('groupIds', [groupId]);
    }
  }, [groupId]);

  return (
    <ul className="flex flex-col gap-12">
      <li>
        <Badge className="flex flex-col gap-2 size-full items-start p-4">
          <span className="font-bold">Contradictionary permissions</span>
          <p className="text-sm whitespace-break-spaces">
            When a team member is part of two or more User Groups with
            contradicting permissions, the negative permission will overrule.
          </p>
          <p className="text-sm whitespace-break-spaces">
            For example, if you're a part of the "Admin Group" with all
            permissions allowed, but you're also in the "Support Group" with
            fewer permissions, you’ll abide by the “Support Group” permissions.
          </p>
        </Badge>
      </li>
      <li className="flex flex-col gap-4">
        <span className="font-semibold">
          1. What action do you grant permission to?
        </span>
        <Form.Field
          control={control}
          name="module"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Module</Form.Label>
              <SelectModule.FormItem
                value={field.value}
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <AnimatePresence mode="popLayout">
          {module && (
            <motion.div>
              <Form.Field
                control={control}
                name="actions"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Actions</Form.Label>
                    <SelectActions.FormItem
                      value={field.value}
                      mode="multiple"
                      onValueChange={field.onChange}
                      selectedModule={module}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </li>
      <li className="flex flex-col gap-4">
        <span className="font-semibold">2. Who can do these actions?</span>
        <Form.Field
          control={control}
          name="groupIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Group</Form.Label>
              <Form.Control>
                <SelectUsersGroup.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  mode="multiple"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="userIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Users</Form.Label>
              <Form.Control>
                <SelectMember.FormItem
                  mode="multiple"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </li>
      <li>
        <Form.Field
          control={control}
          name="allowed"
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2">
              <Form.Label>Allow</Form.Label>
              <Form.Control>
                <div className="flex items-center !m-0">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </li>
    </ul>
  );
};

export const PermissionsFix = () => {
  const { permissionsFix, loading } = usePermissionsFix();
  return (
    <Button
      type="button"
      variant="ghost"
      className="border"
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation();
        permissionsFix({
          onCompleted: () => toast({ title: 'Fixed permissions' }),
        });
      }}
    >
      {loading ? <Spinner size={'sm'} /> : <IconTool />}
      Fix Permission
    </Button>
  );
};

export const PermissionsTopbar = () => {
  return (
    <div className="flex items-center gap-4 ml-auto">
      <PermissionsFix />
      <PermissionsCreate />
    </div>
  );
};

export const Permissions = Object.assign({
  SidebarItem: PermissionsSidebarItem,
  SidebarSubItem: PermissionsSidebarSubItem,
  SidebarGroup: PermissionsSidebarGroup,
  RecordTable: PermissionsRecordTable,
  Filter: PermissionsFilter,
  View: PermissionsView,
  Create: PermissionsCreate,
  Fix: PermissionsFix,
  Topbar: PermissionsTopbar,
});

import {
  Button,
  Spinner,
  useToast,
  Input,
  Badge,
  TextOverflowTooltip,
  cn,
  Checkbox,
  Label,
} from 'erxes-ui';
import { useCallback, useMemo, useState } from 'react';
import { IconSend, IconX } from '@tabler/icons-react';
import { useUsersInvite } from '@/settings/team-member/hooks/useUsersInvite';
import { z } from 'zod';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';
import {
  useGetPermissionDefaultGroups,
  useGetPermissionGroups,
} from '@/settings/permissions/hooks/useGetPermissionGroups';
import {
  IDefaultPermissionGroup,
  IPermissionGroup,
} from '@/settings/permissions/types';

const emailSchema = z.string().email();
type InviteStep = 'emails' | 'permissions';
const normalizeEmail = (value: string) => value.trim().toLowerCase();

export function InviteForm({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { handleInvitations, loading } = useUsersInvite();
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<InviteStep>('emails');
  const [selectedPermissionGroupIds, setSelectedPermissionGroupIds] = useState<
    string[]
  >([]);
  const { t } = useTranslation('settings', {
    keyPrefix: 'team-member',
  });
  const { hasActionPermission } = usePermissionCheck();
  const canManagePermissions = hasActionPermission('permissionsManage');
  const shouldLoadPermissionGroups =
    canManagePermissions && step === 'permissions';
  const {
    defaultGroups,
    loading: defaultGroupsLoading,
    error: defaultGroupsError,
  } = useGetPermissionDefaultGroups({
    skip: !shouldLoadPermissionGroups,
  });
  const {
    permissionGroups,
    loading: customGroupsLoading,
    error: customGroupsError,
  } = useGetPermissionGroups({
    skip: !shouldLoadPermissionGroups,
  });
  const permissionGroupsError = defaultGroupsError || customGroupsError;

  const addTag = (value: string) => {
    const normalizedValue = normalizeEmail(value);

    if (!normalizedValue) return;

    const validation = emailSchema.safeParse(normalizedValue);
    if (!validation.success) {
      setError('Please enter a valid email address');
      return;
    }

    if (tags.includes(normalizedValue)) {
      setError('This email has already been added');
      return;
    }

    setTags([...tags, normalizedValue]);
    setInputValue('');
    setError('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError('');

    if (value.endsWith(',') || value.endsWith(' ')) {
      addTag(value.slice(0, -1));
    } else {
      setInputValue(value);
    }
  };

  const getDraftState = useCallback(() => {
    const draftEmail = normalizeEmail(inputValue);

    if (!draftEmail) {
      return {
        draftEmail,
        isEmpty: true,
        isValid: false,
        isDuplicate: false,
      };
    }

    return {
      draftEmail,
      isEmpty: false,
      isValid: emailSchema.safeParse(draftEmail).success,
      isDuplicate: tags.includes(draftEmail),
    };
  }, [inputValue, tags]);

  const validateInvitations = useCallback(() => {
    const { isDuplicate, isEmpty, isValid } = getDraftState();

    setError('');

    if (tags.length === 0 && isEmpty) {
      toast({
        title: 'Please add at least one email address',
        variant: 'destructive',
      });
      return false;
    }

    if (!isEmpty && !isValid) {
      setError('Please enter a valid email address');
      return false;
    }

    if (isDuplicate) {
      setError('This email has already been added');
      return false;
    }

    return true;
  }, [getDraftState, tags.length, toast]);

  const getInvitationEntries = useCallback(() => {
    const { draftEmail, isDuplicate, isValid } = getDraftState();
    const permissionGroupIds =
      selectedPermissionGroupIds.length > 0
        ? { permissionGroupIds: selectedPermissionGroupIds }
        : {};

    return [
      ...tags.map((tag) => ({
        email: tag,
        ...permissionGroupIds,
      })),
      ...(isValid && !isDuplicate
        ? [
            {
              email: draftEmail,
              ...permissionGroupIds,
            },
          ]
        : []),
    ];
  }, [getDraftState, selectedPermissionGroupIds, tags]);

  const submitHandler = useCallback(async () => {
    if (!validateInvitations()) {
      return;
    }

    if (step === 'permissions' && permissionGroupsError) {
      toast({
        title: t('permission-groups-load-failed'),
        variant: 'destructive',
      });
      return;
    }

    handleInvitations({
      variables: {
        entries: getInvitationEntries(),
      },
      onCompleted() {
        toast({ title: 'Invitation has been sent', variant: 'success' });
        setIsOpen(false);
      },
      onError(e: ApolloError) {
        toast({
          title: 'Failed to send invitation',
          description: e.message,
          variant: 'destructive',
        });
      },
    });
  }, [
    getInvitationEntries,
    handleInvitations,
    permissionGroupsError,
    setIsOpen,
    step,
    t,
    toast,
    validateInvitations,
  ]);

  const handleNext = useCallback(() => {
    if (!validateInvitations()) {
      return;
    }

    const { draftEmail, isEmpty } = getDraftState();

    if (!isEmpty) {
      setTags((current) =>
        current.includes(draftEmail) ? current : [...current, draftEmail],
      );
      setInputValue('');
    }

    setStep('permissions');
  }, [getDraftState, validateInvitations]);

  const defaultGroupPluginById = useMemo(() => {
    return defaultGroups.reduce<Map<string, string>>((groups, group) => {
      groups.set(group.id, group.plugin || 'other');
      return groups;
    }, new Map());
  }, [defaultGroups]);

  const groupedDefaultGroups = useMemo(() => {
    return defaultGroups.reduce<Record<string, IDefaultPermissionGroup[]>>(
      (groups, group) => {
        const plugin = group.plugin || 'other';
        groups[plugin] = [...(groups[plugin] || []), group];
        return groups;
      },
      {},
    );
  }, [defaultGroups]);

  const handlePermissionGroupChange = useCallback(
    (groupId: string, checked: boolean, plugin?: string) => {
      setSelectedPermissionGroupIds((current) => {
        if (checked) {
          if (plugin) {
            return [
              ...current.filter(
                (id) => defaultGroupPluginById.get(id) !== plugin,
              ),
              groupId,
            ];
          }

          if (current.includes(groupId)) {
            return current;
          }

          return [...current, groupId];
        }

        return current.filter((id) => id !== groupId);
      });
    },
    [defaultGroupPluginById],
  );

  const renderPermissionGroup = (
    group: IDefaultPermissionGroup | IPermissionGroup,
    groupId: string,
    plugin?: string,
  ) => {
    const inputId = `invite-permission-${groupId}`;

    return (
      <div
        key={groupId}
        className="flex items-start gap-3 rounded-md border border-border px-3 py-2.5"
      >
        <Checkbox
          id={inputId}
          checked={selectedPermissionGroupIds.includes(groupId)}
          onCheckedChange={(checked) =>
            handlePermissionGroupChange(groupId, checked as boolean, plugin)
          }
        />
        <div className="min-w-0 flex-1">
          <Label
            variant="peer"
            htmlFor={inputId}
            className="block cursor-pointer text-sm font-medium"
          >
            {group.name}
          </Label>
          {group.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {group.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  const isPermissionGroupsLoading =
    shouldLoadPermissionGroups && (defaultGroupsLoading || customGroupsLoading);

  return (
    <div className="flex flex-col gap-4">
      {step === 'emails' && (
        <>
          <div className="flex flex-col gap-3">
            <div className="w-full">
              <Input
                name="email"
                placeholder="Enter email addresses"
                value={inputValue}
                autoFocus
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={cn(
                  error && 'focus-visible:shadow-focus-destructive',
                )}
              />
              {error && (
                <p className="text-sm text-destructive mt-1.5">{error}</p>
              )}
              {!error && (
                <p className="text-sm text-muted-foreground mt-1.5">
                  {t('separate-emails')}
                </p>
              )}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1.5 pr-1.5 max-w-full"
                  >
                    <TextOverflowTooltip value={tag} className="truncate" />
                    <button
                      type="button"
                      aria-label={`Remove ${tag}`}
                      onClick={() => removeTag(tag)}
                      className="hover:bg-secondary-foreground/20 rounded-sm p-0.5 shrink-0"
                    >
                      <IconX className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="w-full flex gap-3 justify-end">
            {canManagePermissions ? (
              <Button onClick={handleNext} className="text-sm">
                {t('next')}
              </Button>
            ) : (
              <Button
                onClick={submitHandler}
                disabled={loading}
                className="text-sm"
              >
                {loading ? (
                  <Spinner size={'sm'} className="stroke-white" />
                ) : (
                  <IconSend size={16} />
                )}
                {t('send-invites')}
              </Button>
            )}
          </div>
        </>
      )}

      {step === 'permissions' && (
        <>
          {isPermissionGroupsLoading ? (
            <Spinner containerClassName="py-10" />
          ) : permissionGroupsError ? (
            <p className="text-sm text-destructive">
              {t('permission-groups-load-failed')}
            </p>
          ) : (
            <div className="flex max-h-80 flex-col gap-4 overflow-y-auto pr-1 styled-scroll">
              {Object.entries(groupedDefaultGroups).map(([plugin, groups]) => (
                <div key={plugin} className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {plugin}
                  </div>
                  <div className="space-y-2">
                    {groups.map((group) =>
                      renderPermissionGroup(group, group.id, plugin),
                    )}
                  </div>
                </div>
              ))}

              {permissionGroups.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('custom-groups')}
                  </div>
                  <div className="space-y-2">
                    {permissionGroups.map((group) =>
                      renderPermissionGroup(group, group._id),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="w-full flex gap-3 justify-between">
            <Button
              variant="secondary"
              onClick={() => setStep('emails')}
              className="text-sm"
            >
              {t('back')}
            </Button>
            <Button
              onClick={submitHandler}
              disabled={loading || Boolean(permissionGroupsError)}
              className="text-sm"
            >
              {loading ? (
                <Spinner size={'sm'} className="stroke-white" />
              ) : (
                <IconSend size={16} />
              )}
              {t('send-invites')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

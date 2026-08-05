import { PermissionState, StatusItem } from '@/pipelines/types';
import {
  Badge,
  Combobox,
  Label,
  PopoverScoped,
  Spinner,
  ToggleGroup,
  toast,
} from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type MemberType = 'memberIds' | 'canMoveMemberIds' | 'canEditMemberIds';

type StatusPermissionUpdateVariables = {
  canEditMemberIds?: string[];
  canMoveMemberIds?: string[];
  id: string;
  memberIds?: string[];
  visibilityType?: 'public' | 'private';
};

type StatusPermissionUpdate = (options: {
  variables: StatusPermissionUpdateVariables;
}) => Promise<unknown>;

type MemberPermissionConfig = {
  label: string;
  placeholder: string;
  type: MemberType;
};

type PermissionStatus = StatusItem & {
  canEditMemberIds?: string[];
  canMoveMemberIds?: string[];
  memberIds?: string[];
  visibilityType?: 'public' | 'private';
};

type StatusPermissionControlProps = {
  status: PermissionStatus;
  updateStatus: StatusPermissionUpdate;
  values: PermissionState;
};

const MEMBER_PERMISSIONS: MemberPermissionConfig[] = [
  {
    type: 'memberIds',
    label: 'members-title',
    placeholder: 'select-members-can-see',
  },
  {
    type: 'canMoveMemberIds',
    label: 'can-move',
    placeholder: 'select-members-can-move',
  },
  {
    type: 'canEditMemberIds',
    label: 'can-edit',
    placeholder: 'select-members-can-edit',
  },
];

const EMPTY_MEMBER_PERMISSIONS: Record<MemberType, string[]> = {
  memberIds: [],
  canMoveMemberIds: [],
  canEditMemberIds: [],
};

export const StatusPermissionControl = ({
  status,
  updateStatus,
  values,
}: StatusPermissionControlProps) => {
  const { t } = useTranslation('frontline');
  const [isUpdating, setIsUpdating] = useState(false);
  const [memberStates, setMemberStates] = useState<
    Record<MemberType, string[]>
  >({
    memberIds: status.memberIds || [],
    canMoveMemberIds: status.canMoveMemberIds || [],
    canEditMemberIds: status.canEditMemberIds || [],
  });
  const [visibility, setVisibility] = useState<'public' | 'private'>(
    status.visibilityType || values.visibility,
  );
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    setVisibility(status.visibilityType || values.visibility);
    setMemberStates({
      memberIds: status.memberIds || [],
      canMoveMemberIds: status.canMoveMemberIds || [],
      canEditMemberIds: status.canEditMemberIds || [],
    });
    isInitialized.current = true;
  }, [status, values.visibility]);

  const handleVisibilityChange = useCallback(
    async (nextVisibility: 'public' | 'private') => {
      const memberPermissions =
        nextVisibility === 'public' ? EMPTY_MEMBER_PERMISSIONS : memberStates;

      setIsUpdating(true);
      try {
        await updateStatus({
          variables: {
            id: status.value,
            visibilityType: nextVisibility,
            ...(nextVisibility === 'public' ? memberPermissions : {}),
          },
        });
        setVisibility(nextVisibility);

        if (nextVisibility === 'public') {
          setMemberStates(EMPTY_MEMBER_PERMISSIONS);
        }
      } catch (error) {
        toast({
          title: t('error'),
          description: `${t('failed-to-update-visibility')}: ${
            error instanceof Error ? error.message : t('unknown')
          }`,
          variant: 'destructive',
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [memberStates, status.value, t, updateStatus],
  );

  const handleMemberChange = useCallback(
    async (memberType: MemberType, selectedMembers: string[]) => {
      setIsUpdating(true);
      try {
        await updateStatus({
          variables: {
            id: status.value,
            [memberType]: selectedMembers,
          },
        });
        setMemberStates((previousMembers) => ({
          ...previousMembers,
          [memberType]: selectedMembers,
        }));
      } catch (error) {
        toast({
          title: t('error'),
          description: `${t('failed-to-update-member-permission')}: ${
            error instanceof Error ? error.message : t('unknown')
          }`,
          variant: 'destructive',
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [status.value, t, updateStatus],
  );

  const permissionIndicators = MEMBER_PERMISSIONS.filter(
    ({ type }) => memberStates[type].length > 0,
  );

  return (
    <div className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="size-2.5 flex-none rounded-full"
          style={{ backgroundColor: status.color || 'currentColor' }}
        />
        <Label
          className="min-w-0 flex-1 truncate"
          id={`status-permission-${status.value}`}
        >
          {status.label}
        </Label>
        {isUpdating && <Spinner size="sm" />}
        <ToggleGroup
          aria-labelledby={`status-permission-${status.value}`}
          className="flex-none"
          disabled={isUpdating}
          onValueChange={(value) =>
            value && handleVisibilityChange(value as 'public' | 'private')
          }
          size="sm"
          type="single"
          value={visibility}
          variant="outline"
        >
          <ToggleGroup.Item value="public">{t('public')}</ToggleGroup.Item>
          <ToggleGroup.Item value="private">{t('private')}</ToggleGroup.Item>
        </ToggleGroup>
      </div>

      {permissionIndicators.length > 0 && visibility !== 'private' && (
        <div className="flex flex-wrap gap-2 pl-5">
          {permissionIndicators.map(({ label, type }) => (
            <Badge key={type} variant="secondary">
              {t(label)}
              <span className="font-mono text-muted-foreground">
                {memberStates[type].length}
              </span>
            </Badge>
          ))}
        </div>
      )}

      {visibility === 'private' && (
        <div className="flex flex-col gap-3 pl-5">
          {MEMBER_PERMISSIONS.map((config) => (
            <div className="flex flex-col gap-2" key={config.type}>
              <Label>{t(config.label)}</Label>
              <SelectMember.Provider
                mode="multiple"
                onValueChange={(value) => {
                  void handleMemberChange(
                    config.type,
                    Array.isArray(value) ? value : [],
                  );
                }}
                value={memberStates[config.type]}
              >
                <PopoverScoped>
                  <Combobox.Trigger className="w-full" disabled={isUpdating}>
                    <SelectMember.Value placeholder={t(config.placeholder)} />
                  </Combobox.Trigger>
                  <Combobox.Content>
                    <SelectMember.Content />
                  </Combobox.Content>
                </PopoverScoped>
              </SelectMember.Provider>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

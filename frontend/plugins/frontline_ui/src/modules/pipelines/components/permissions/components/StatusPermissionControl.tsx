import { useState, useCallback, useEffect, useRef } from 'react';
import { toast, PopoverScoped, Combobox, Select } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { StatusItem, PermissionState } from '@/pipelines/types';
import { cn } from 'erxes-ui';

type MemberType = 'memberIds' | 'canMoveMemberIds' | 'canEditMemberIds';

interface MemberPermissionConfig {
  type: MemberType;
  label: string;
  placeholder: string;
  color: string;
  bgColor: string;
}

interface StatusPermissionControlProps {
  status: StatusItem & {
    memberIds?: string[];
    canMoveMemberIds?: string[];
    canEditMemberIds?: string[];
    departmentIds?: string[];
    visibilityType?: 'public' | 'private';
  };
  values: PermissionState;
  updateStatus: (options: any) => Promise<any>;
}

const MEMBER_PERMISSIONS: MemberPermissionConfig[] = [
  {
    type: 'memberIds',
    label: 'Members Selection',
    placeholder: 'Select members',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 text-blue-600',
  },
  {
    type: 'canMoveMemberIds',
    label: 'Can Move Members',
    placeholder: 'Select members who can move',
    color: 'bg-green-500',
    bgColor: 'bg-green-50 text-green-600',
  },
  {
    type: 'canEditMemberIds',
    label: 'Can Edit Members',
    placeholder: 'Select members who can edit',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 text-purple-600',
  },
];

export const StatusPermissionControl = ({
  status,
  values,
  updateStatus,
}: StatusPermissionControlProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [memberStates, setMemberStates] = useState<
    Record<MemberType, string[]>
  >({
    memberIds: status.memberIds || [],
    canMoveMemberIds: status.canMoveMemberIds || [],
    canEditMemberIds: status.canEditMemberIds || [],
  });
  const [visibility, setVisibility] = useState<'public' | 'private'>(
    status.visibilityType || 'public',
  );
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      const initialVisibility =
        status.visibilityType || values?.visibility || 'public';
      const initialMemberStates = {
        memberIds: status.memberIds || [],
        canMoveMemberIds: status.canMoveMemberIds || [],
        canEditMemberIds: status.canEditMemberIds || [],
      };

      setVisibility(initialVisibility as 'public' | 'private');
      setMemberStates(initialMemberStates);
      isInitialized.current = true;
    }
  }, [
    status.visibilityType,
    values?.visibility,
    status.memberIds,
    status.canMoveMemberIds,
    status.canEditMemberIds,
  ]);

  const handleVisibilityChange = useCallback(
    async (newVisibility: 'public' | 'private') => {
      setIsUpdating(true);
      try {
        await updateStatus({
          variables: {
            id: status.value,
            visibilityType: newVisibility,
          },
        });
        setVisibility(newVisibility);
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to update visibility: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          variant: 'destructive',
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [status.value, updateStatus],
  );

  const handleMemberChange = useCallback(
    async (memberType: MemberType, selectedUsers: string[]) => {
      setIsUpdating(true);
      try {
        await updateStatus({
          variables: {
            id: status.value,
            [memberType]: selectedUsers,
          },
        });

        setMemberStates((prev) => ({
          ...prev,
          [memberType]: selectedUsers,
        }));
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to update ${memberType}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          variant: 'destructive',
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [status.value, updateStatus],
  );

  const MemberPermissionSelector = ({
    config,
  }: {
    config: MemberPermissionConfig;
  }) => (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full', config.color)} />
        {config.label}
      </label>

      <SelectMember.Provider
        value={memberStates[config.type]}
        onValueChange={(value) => {
          const membersArray = Array.isArray(value) ? value : [];
          handleMemberChange(config.type, membersArray);
        }}
        mode="multiple"
      >
        <PopoverScoped>
          <Combobox.Trigger
            className="w-full h-8 rounded-lg border border-border/50 bg-background hover:bg-accent/50 transition-colors text-sm"
            disabled={isUpdating}
          >
            <SelectMember.Value placeholder={config.placeholder} />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectMember.Content />
          </Combobox.Content>
        </PopoverScoped>
      </SelectMember.Provider>
    </div>
  );

  const PermissionIndicators = () => {
    const indicators = MEMBER_PERMISSIONS.filter(
      (config) => memberStates[config.type].length > 0,
    );

    if (indicators.length === 0) return null;

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {indicators.map((config) => {
          const count = memberStates[config.type].length;
          const label =
            config.type === 'memberIds'
              ? `member${count !== 1 ? 's' : ''}`
              : config.type === 'canMoveMemberIds'
              ? 'can move'
              : 'can edit';

          return (
            <span
              key={config.type}
              className={cn('text-xs px-2 py-1 rounded', config.bgColor)}
            >
              {count} {label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-md bg-muted/30 border">
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: status.color || '#000000' }}
        />
        <span className="text-sm font-medium">{status.label}</span>
      </div>

      <PermissionIndicators />
      <div className="space-y-2">
        <div className="text-sm font-medium">Status Visibility</div>
        <Select
          value={visibility}
          onValueChange={handleVisibilityChange}
          disabled={isUpdating}
        >
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="public">Public</Select.Item>
            <Select.Item value="private">Private</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          Configure individual status permissions
          {isUpdating && (
            <span className="ml-2 text-xs text-blue-600 animate-pulse">
              Updating...
            </span>
          )}
        </div>

        <div className="space-y-4">
          {MEMBER_PERMISSIONS.map((config) => (
            <MemberPermissionSelector key={config.type} config={config} />
          ))}
        </div>
      </div>
    </div>
  );
};

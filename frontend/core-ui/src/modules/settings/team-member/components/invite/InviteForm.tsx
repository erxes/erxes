import {
  Button,
  Spinner,
  useToast,
  Input,
  Badge,
  TextOverflowTooltip,
  cn,
  Dialog,
  Checkbox,
} from 'erxes-ui';
import { useCallback, useState } from 'react';
import { IconSend, IconX } from '@tabler/icons-react';
import { useUsersInvite } from '@/settings/team-member/hooks/useUsersInvite';
import { usePermissionGroups } from '@/settings/team-member/hooks/usePermissionGroups';
import { z } from 'zod';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';

const emailSchema = z.string().email();

export function InviteForm({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { handleInvitations, loading } = useUsersInvite();
  const { permissionGroups, loading: permissionGroupsLoading } = usePermissionGroups();
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPermissionGroups, setSelectedPermissionGroups] = useState<string[]>([]);
  const { t } = useTranslation('settings', {
    keyPrefix: 'team-member',
  });
  const addTag = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return;

    const validation = emailSchema.safeParse(trimmedValue);
    if (!validation.success) {
      setError('Please enter a valid email address');
      return;
    }

    if (tags.includes(trimmedValue)) {
      setError('This email has already been added');
      return;
    }

    setTags([...tags, trimmedValue]);
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

  const handlePermissionGroupChange = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissionGroups([...selectedPermissionGroups, groupId]);
    } else {
      setSelectedPermissionGroups(selectedPermissionGroups.filter(id => id !== groupId));
    }
  };

  const submitHandler = useCallback(async () => {
    const validation = emailSchema.safeParse(inputValue);

    if (tags.length === 0 && !validation.success) {
      toast({
        title: 'Please add at least one email address',
        variant: 'destructive',
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  }, [toast, tags, inputValue]);

  const handleConfirm = useCallback(async () => {
    const validation = emailSchema.safeParse(inputValue);

    handleInvitations({
      variables: {
        entries: [
          ...tags.map((tag) => ({
            email: tag,
            permissionGroupIds: selectedPermissionGroups.length > 0 ? selectedPermissionGroups : undefined,
          })),
          ...(validation.success ? [{ 
            email: inputValue,
            permissionGroupIds: selectedPermissionGroups.length > 0 ? selectedPermissionGroups : undefined,
          }] : []),
        ],
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
  }, [handleInvitations, setIsOpen, toast, tags, inputValue, selectedPermissionGroups]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <Input
            name="email"
            placeholder="Enter email addresses"
            value={inputValue}
            autoFocus
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cn(error && 'focus-visible:shadow-focus-destructive')}
          />
          {error && <p className="text-sm text-destructive mt-1.5">{error}</p>}
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
        <Button onClick={submitHandler} disabled={loading} className="text-sm">
          {(loading && <Spinner size={'sm'} className="stroke-white" />) || (
            <IconSend size={16} />
          )}
          {t('send-invites')}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <Dialog.Content className="max-w-md xl:max-w-lg p-0">
          <Dialog.Header className="px-3 py-[13px] border-b border-muted">
            <Dialog.Title className="flex items-center gap-2 text-sm">
              <IconSend size={14} />
              Confirm Invitations
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Confirm team member invitations
            </Dialog.Description>
            <Dialog.Close asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-2"
              >
                <IconX />
              </Button>
            </Dialog.Close>
          </Dialog.Header>
          <div className="flex flex-col gap-6 px-3 pb-3">
            <span className="text-accent-foreground">
              Review and confirm the invitations
            </span>
            
            {/* Email Section */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Email addresses to invite:</p>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg min-h-[60px] max-h-32 overflow-y-auto">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1.5 pr-1.5 max-w-full"
                    >
                      <TextOverflowTooltip value={tag} className="truncate" />
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-secondary-foreground/20 rounded-sm p-0.5 shrink-0"
                      >
                        <IconX className="size-3" />
                      </button>
                    </Badge>
                  ))}
                  {emailSchema.safeParse(inputValue).success && (
                    <Badge
                      variant="secondary"
                      className="gap-1.5 pr-1.5 max-w-full"
                    >
                      <TextOverflowTooltip value={inputValue} className="truncate" />
                      <button
                        onClick={() => setInputValue('')}
                        className="hover:bg-secondary-foreground/20 rounded-sm p-0.5 shrink-0"
                      >
                        <IconX className="size-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Permission Groups Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Permission Groups</p>
                <Badge variant="secondary" className="text-xs">
                  {selectedPermissionGroups.length} selected
                </Badge>
              </div>
              
              {permissionGroupsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="sm" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading permission groups...</span>
                </div>
              ) : permissionGroups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No permission groups available</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {permissionGroups.map((group) => {
                    const isSelected = selectedPermissionGroups.includes(group.id);
                    return (
                      <div
                        key={group.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handlePermissionGroupChange(group.id, !isSelected)}
                      >
                        <div className="flex-1">
                          <label
                              htmlFor={`permission-${group.id}`}
                              className="text-sm font-medium cursor-pointer block"
                            >
                              {group.name}
                            </label>
                          <p className="text-xs text-muted-foreground">{group.description}</p>
                        </div>
                        <Checkbox
                          id={`permission-${group.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => handlePermissionGroupChange(group.id, checked as boolean)}
                          className="pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <Dialog.Footer className="flex items-center justify-end gap-3 px-3 py-3 border-t bg-muted/30">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <IconSend className="mr-2" />
                  Send Invitations
                </>
              )}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}

import { createContext, useContext, ReactNode } from 'react';
import { ITask } from '@/task/types';
import { Command, useToast } from 'erxes-ui';
import {
  IconChevronRight,
  IconCopy,
  IconLink,
  IconLetterCase,
  IconFileText,
  IconMarkdown,
} from '@tabler/icons-react';
import { useTags, useUsers } from 'ui-modules';
import { PROJECT_PRIORITIES_OPTIONS } from '@/operation/constants/priorityLabels';
import { useGetStatusByTeam } from '@/task/hooks/useGetStatusByTeam';
import { format } from 'date-fns';

type CopyType = 'url' | 'title' | 'titleAndDescription' | 'markdown';

interface CopyTaskContextValue {
  onCopy: (type: CopyType) => void;
}

const CopyTaskContext = createContext<CopyTaskContextValue | null>(null);

const useCopyTaskContext = () => {
  const context = useContext(CopyTaskContext);
  if (!context) {
    throw new Error('useCopyTaskContext must be used within CopyTaskProvider');
  }
  return context;
};

const getTaskUrl = (task: ITask): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/operation/team/${task.teamId}/tasks/${task._id}`;
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Not set';
  return format(new Date(dateStr), 'MMM dd, yyyy');
};

const parseDescription = (description?: string): string => {
  if (!description) return '';
  
  try {
    const blocks = JSON.parse(description);
    if (!Array.isArray(blocks)) return description;
    
    const extractText = (content: { type: string; text?: string }[]): string => {
      if (!Array.isArray(content)) return '';
      return content
        .filter((item) => item.type === 'text' && item.text)
        .map((item) => item.text)
        .join('');
    };
    
    return blocks
      .map((block) => extractText(block.content || []))
      .filter(Boolean)
      .join('\n');
  } catch {
    return description;
  }
};

interface CopyTaskProviderProps {
  children: ReactNode;
  tasks: ITask[];
  setOpen: (open: boolean) => void;
}

export const CopyTaskProvider = ({
  children,
  tasks,
  setOpen,
}: CopyTaskProviderProps) => {
  const { toast } = useToast();

  const assigneeIds = [
    ...new Set(tasks.map((t) => t.assigneeId).filter(Boolean)),
  ];
  const { users } = useUsers({
    variables: { ids: assigneeIds },
    skip: assigneeIds.length === 0,
  });

  const tagIds = [...new Set(tasks.flatMap((t) => t.tagIds || []))];
  const { tags } = useTags({
    variables: {
      ids: tagIds,
      type: 'operation:task',
      includeWorkspaceTags: true,
    },
    skip: tagIds.length === 0,
  });

  const teamIds = [...new Set(tasks.map((t) => t.teamId).filter(Boolean))];
  const { statuses } = useGetStatusByTeam({
    variables: { teamId: teamIds[0] },
    skip: teamIds.length === 0,
  });

  const getAssigneeName = (assigneeId: string): string => {
    if (!assigneeId) return 'Unassigned';
    const user = users?.find((u) => u._id === assigneeId);
    return user?.details?.fullName || assigneeId;
  };

  const getTagNames = (taskTagIds: string[]): string => {
    if (!taskTagIds?.length) return 'None';
    const tagNames = taskTagIds
      .map((id) => tags?.find((t) => t._id === id)?.name)
      .filter(Boolean);
    return tagNames.length > 0 ? tagNames.join(', ') : 'None';
  };

  const getStatusLabel = (status: string): string => {
    return (
      statuses?.find((s) => s.value === status)?.label || status || 'No Status'
    );
  };

  const getPriorityLabel = (priority: number): string => {
    return PROJECT_PRIORITIES_OPTIONS[priority] || 'No Priority';
  };

  const generateMarkdown = (t: ITask): string => `**Name:** ${
    t.name || 'Untitled'
  }
**Description:** ${parseDescription(t.description) || 'No description'}
**URL:** ${getTaskUrl(t)}
**Status:** ${getStatusLabel(t.status)}
**Priority:** ${getPriorityLabel(t.priority)}
**Assign to:** ${getAssigneeName(t.assigneeId)}
**Tag:** ${getTagNames(t.tagIds)}
**Created:** ${formatDate(t.createdAt)}
**Updated:** ${formatDate(t.updatedAt)}`;

  const generateContent = (type: CopyType): string => {
    const isSingle = tasks.length === 1;
    const separator = '\n\n---\n\n';

    switch (type) {
      case 'url':
        return tasks.map(getTaskUrl).join('\n');
      case 'title':
        return tasks.map((t) => t.name || '').join('\n');
      case 'titleAndDescription':
        return tasks
          .map((t) => `**Name:** ${t.name || ''}\n**Description:** ${parseDescription(t.description) || 'No description'}`)
          .join(isSingle ? '' : separator);
      case 'markdown':
        return tasks.map(generateMarkdown).join(separator);
      default:
        return '';
    }
  };

  const handleCopy = async (type: CopyType) => {
    const content = generateContent(type);
    const labels: Record<CopyType, string> = {
      url: 'URL',
      title: 'Title',
      titleAndDescription: 'Title & Description',
      markdown: 'Markdown',
    };

    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied!',
        description: `${labels[type]} copied to clipboard`,
      });
      setOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy',
        variant: 'destructive',
      });
    }
  };

  return (
    <CopyTaskContext.Provider value={{ onCopy: handleCopy }}>
      {children}
    </CopyTaskContext.Provider>
  );
};

const COPY_OPTIONS = [
  { type: 'url' as const, label: 'URL', icon: IconLink },
  { type: 'title' as const, label: 'Title', icon: IconLetterCase },
  {
    type: 'titleAndDescription' as const,
    label: 'Title & Description',
    icon: IconFileText,
  },
  { type: 'markdown' as const, label: 'Markdown format', icon: IconMarkdown },
];

export const CopyTaskContent = () => {
  const { onCopy } = useCopyTaskContext();

  return (
    <Command>
      <Command.List>
        {COPY_OPTIONS.map(({ type, label, icon: Icon }) => (
          <Command.Item key={type} onSelect={() => onCopy(type)}>
            <Icon className="size-4 mr-2" />
            <span>{label}</span>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const CopyTaskCommandBarItem = ({
  tasks,
  setOpen,
}: {
  tasks: ITask[];
  setOpen: (open: boolean) => void;
}) => (
  <CopyTaskProvider tasks={tasks} setOpen={setOpen}>
    <CopyTaskContent />
  </CopyTaskProvider>
);

export const CopyTaskTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (content: string) => void;
}) => (
  <Command.Item onSelect={() => setCurrentContent('copy')}>
    <IconCopy className="size-4" />
    <div className="flex items-center flex-1">Copy</div>
    <IconChevronRight className="size-4 text-muted-foreground" />
  </Command.Item>
);

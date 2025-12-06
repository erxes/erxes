import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { format, nextFriday, addDays } from 'date-fns';
import { Button, Calendar, Command } from 'erxes-ui';
import {
  IconCalendarEvent,
  IconCalendarTime,
  IconChevronLeft,
  IconClock,
} from '@tabler/icons-react';

interface SetDueDateContextValue {
  taskIds: string[];
  onSetDueDate: (date: Date) => void;
  loading: boolean;
}

const SetDueDateContext = createContext<SetDueDateContextValue | null>(null);

export const useSetDueDateContext = () => {
  const context = useContext(SetDueDateContext);
  if (!context) {
    throw new Error(
      'useSetDueDateContext must be used within SetDueDateProvider',
    );
  }
  return context;
};

interface SetDueDateProviderProps {
  children: ReactNode;
  taskIds: string[];
}

export const SetDueDateProvider = ({
  children,
  taskIds,
}: SetDueDateProviderProps) => {
  const { updateTask, loading } = useUpdateTask();
  const handleSetDueDate = useCallback(async (date: Date) => {
    await Promise.all(
      taskIds.map((id) =>
        updateTask({
          variables: {
            _id: id,
            targetDate: date.toISOString(),
          },
        }),
      ),
    );
  }, [taskIds, updateTask]);
  return (
    <SetDueDateContext.Provider
      value={{
        taskIds,
        onSetDueDate: handleSetDueDate,
        loading,
      }}
    >
      {children}
    </SetDueDateContext.Provider>
  );
};

const getEndOfWeek = (): Date => {
  const today = new Date();
  return nextFriday(today);
};

const buildDueDateOptions = () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const endOfWeek = getEndOfWeek();
  const inOneWeek = addDays(today, 7);

  return [
    {
      label: 'Tomorrow',
      date: tomorrow,
      description: format(tomorrow, 'EEE, MMM dd'),
    },
    {
      label: 'End of this week',
      date: endOfWeek,
      description: format(endOfWeek, 'EEE, MMM dd'),
    },
    {
      label: 'In one week',
      date: inOneWeek,
      description: format(inOneWeek, 'EEE, MMM dd'),
    },
  ];
};

export const TaskSetDueDateContent = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const { onSetDueDate, loading } = useSetDueDateContext();
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSelectDate = (date: Date) => {
    onSetDueDate(date);
    setShowCalendar(false);
  };

  if (showCalendar) {
    return (
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="justify-start mb-2 w-full"
          onClick={() => setShowCalendar(false)}
        >
          <IconChevronLeft className="size-4 mr-1" />
          Back to options
        </Button>
        <Calendar
          mode="single"
          onSelect={(date) => {
            if (date) {
              handleSelectDate(date);
              setOpen(false);
            }
          }}
          disabled={loading}
        />
      </div>
    );
  }

  return (
    <Command>
      <Command.List>
        <Command.Item
          onSelect={() => {
            setShowCalendar(true);
          }}
          className="cursor-pointer"
          disabled={loading}
        >
          <IconCalendarTime className="size-4 mr-2" />
          <span>Custom date</span>
        </Command.Item>

        <Command.Separator />

        {buildDueDateOptions().map((option) => (
          <Command.Item
            key={option.label}
            onSelect={() => {
              handleSelectDate(option.date);
              setOpen(false);
            }}
            className="cursor-pointer"
            disabled={loading}
          >
            <IconClock className="size-4 mr-2" />
            <div className="flex justify-between items-center w-full">
              <span>{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </div>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

interface SetDueDateCommandBarItemProps {
  taskIds: string[];
  setOpen: (open: boolean) => void;
}

export const TasksSetDueDateCommandBarItem = ({
  taskIds,
  setOpen,
}: SetDueDateCommandBarItemProps) => {
  return (
    <SetDueDateProvider taskIds={taskIds}>
      <TaskSetDueDateContent setOpen={setOpen} />
    </SetDueDateProvider>
  );
};

export const TasksSetDueDateTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (content: string) => void;
}) => {
  return (
    <Command.Item onSelect={() => setCurrentContent('setTargetDate')}>
      <IconCalendarEvent className="size-4" />
      <div className="flex items-center">Set Target Date</div>
    </Command.Item>
  );
};

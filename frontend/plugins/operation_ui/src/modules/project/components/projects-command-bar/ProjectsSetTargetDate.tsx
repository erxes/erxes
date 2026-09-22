import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { format, nextFriday, addDays } from 'date-fns';
import { Button, Calendar, Command } from 'erxes-ui';
import {
  IconCalendarTime,
  IconChevronLeft,
  IconClock,
} from '@tabler/icons-react';

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
      label: 'tomorrow',
      date: tomorrow,
      description: format(tomorrow, 'EEE, MMM dd'),
    },
    {
      label: 'end-of-this-week',
      date: endOfWeek,
      description: format(endOfWeek, 'EEE, MMM dd'),
    },
    {
      label: 'in-one-week',
      date: inOneWeek,
      description: format(inOneWeek, 'EEE, MMM dd'),
    },
  ];
};

export const ProjectsSetTargetDateTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (content: string) => void;
}) => {
  const { t } = useTranslation('operation');
  return (
    <Command.Item onSelect={() => setCurrentContent('targetDate')}>
      <div className="flex gap-2 items-center">{t('set-target-date')}</div>
    </Command.Item>
  );
};

export const ProjectsSetTargetDateContent = ({
  projectIds,
  setOpen,
}: {
  projectIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('operation');
  const { updateProject, loading } = useUpdateProject();
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSetDueDate = async (date: Date) => {
    await Promise.all(
      projectIds.map((id) =>
        updateProject({
          variables: {
            _id: id,
            targetDate: date.toISOString(),
          },
        }),
      ),
    );
    setOpen(false);
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
          {t('back-to-options')}
        </Button>
        <Calendar
          mode="single"
          onSelect={(date) => {
            if (date) {
              handleSetDueDate(date);
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
          <span>{t('custom-date')}</span>
        </Command.Item>

        <Command.Separator />

        {buildDueDateOptions().map((option) => (
          <Command.Item
            key={option.label}
            onSelect={() => {
              handleSetDueDate(option.date);
            }}
            className="cursor-pointer"
            disabled={loading}
          >
            <IconClock className="size-4 mr-2" />
            <div className="flex justify-between items-center w-full">
              <span>{t(option.label)}</span>
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

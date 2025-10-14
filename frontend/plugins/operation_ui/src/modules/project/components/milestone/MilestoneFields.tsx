import { IconCalendarTime } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Button, Calendar, Combobox, Form, Popover } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export const MilestoneFields = ({
  isActive,
  triggerContent,
  onSubmit,
  onClick,
  setActiveMilestone,
}: {
  isActive: boolean;
  triggerContent: React.ReactNode;
  onSubmit: (data: any) => void;
  onClick: () => void;
  setActiveMilestone: (milestoneId: string | null) => void;
}) => {
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const milestoneRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const { control, watch, handleSubmit } = useFormContext();

  const targetDateValue = watch('targetDate');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open) return;

      if (
        milestoneRef.current &&
        !milestoneRef.current.contains(e.target as Node)
      ) {
        setActiveMilestone(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [milestoneRef, open]);

  if (!isActive) {
    return (
      <Button
        className="flex justify-start gap-2 items-center text-sm font-normal h-10 py-1"
        asChild
        variant="ghost"
        size="lg"
        onClick={onClick}
      >
        {triggerContent}
      </Button>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setActiveMilestone(null);
    }
  };

  return (
    <Button
      className="flex justify-start gap-2 items-center text-sm font-normal h-10 py-1"
      asChild
      variant="ghost"
      size="lg"
    >
      <div onKeyDown={handleKeyDown} ref={milestoneRef}>
        <form
          onSubmit={handleSubmit(onSubmit, (error) => console.log(error))}
          className="w-full h-full flex items-center"
        >
          <div className="w-full flex justify-between items-center">
            <Form.Field
              name="name"
              control={control}
              render={({ field }) => (
                <Form.Item className="w-full">
                  <input
                    {...field}
                    ref={nameInputRef}
                    type="text"
                    placeholder="Milestone name"
                    autoFocus
                    className="bg-transparent outline-none border-none focus:ring-0 focus:outline-none w-full"
                  />
                </Form.Item>
              )}
            />
            <Popover open={open} onOpenChange={setOpen}>
              <Popover.Trigger asChild className="cursor-pointer">
                {targetDateValue ? (
                  <span>{format(targetDateValue, 'MMM d')}</span>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-muted-foreground font-semibold hover:bg-transparent"
                    size="sm"
                  >
                    <IconCalendarTime className="size-4 text-muted-foreground" />
                  </Button>
                )}
              </Popover.Trigger>

              <Combobox.Content>
                <Form.Field
                  name="targetDate"
                  control={control}
                  render={({ field }) => (
                    <Form.Item>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(value) => {
                          field.onChange(value);
                          setOpen(false);

                          nameInputRef.current?.focus();
                        }}
                        defaultMonth={field.value}
                      />
                    </Form.Item>
                  )}
                />
              </Combobox.Content>
            </Popover>
          </div>
        </form>
      </div>
    </Button>
  );
};

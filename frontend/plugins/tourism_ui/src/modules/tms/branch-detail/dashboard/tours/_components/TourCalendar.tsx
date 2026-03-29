import { ApolloError } from '@apollo/client';
import {
  Button,
  ScrollArea,
  Select,
  Sheet,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { cn } from 'erxes-ui/lib';
import { useMemo, useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTours } from '../hooks/useTours';
import { TourEditForm } from './TourEditForm';
import { TourCalendarRowActions } from './TourCalendarRowActions';
import { useRemoveTours } from '../hooks/useRemoveTours';
import { ITour } from '../types/tour';

interface TourCalendarProps {
  branchId: string;
}

interface CalendarDay {
  label: string;
  date: Date;
  iso: string;
}

const MONTH_LABELS = Array.from({ length: 12 }).map((_, index) =>
  new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
    new Date(2000, index, 1),
  ),
);

function clampToMinYear(date: Date, minYear: number) {
  if (date.getFullYear() < minYear) {
    return new Date(minYear, 0, 1);
  }
  return date;
}

function createMonthDays(base: Date): CalendarDay[] {
  const year = base.getFullYear();
  const month = base.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    weekday: 'short',
  });

  const diffDays = end.getDate() - start.getDate() + 1;

  return Array.from({ length: diffDays }).map((_, index) => {
    const date = new Date(year, month, start.getDate() + index);

    return {
      label: formatter.format(date),
      date,
      iso: date.toISOString().slice(0, 10),
    };
  });
}

function isDateInRange(date: Date, start?: string, end?: string) {
  if (!start) return false;

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : startDate;

  const startTime = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );

  const endTime = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
  );

  const current = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  return current >= startTime && current <= endTime;
}

export const TourCalendar = ({ branchId }: TourCalendarProps) => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'delete' };
  const { tours, loading } = useTours({
    variables: { branchId },
  });
  const { removeTours } = useRemoveTours();
  const [editTourId, setEditTourId] = useState<string | null>(null);
  const [deletingTourId, setDeletingTourId] = useState<string | null>(null);

  const minYear = 2025;

  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    clampToMinYear(new Date(), minYear),
  );

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const days = useMemo(() => createMonthDays(currentMonth), [currentMonth]);

  const visibleRows = useMemo(() => {
    if (!tours) return [];

    return tours.filter((tour: ITour) =>
      days.some((day) => isDateInRange(day.date, tour.startDate, tour.endDate)),
    );
  }, [tours, days]);

  const hasToursInCurrentMonth = visibleRows.length > 0;

  const handleChangeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const next =
        direction === 'next'
          ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
          : new Date(prev.getFullYear(), prev.getMonth() - 1, 1);

      return clampToMinYear(next, minYear);
    });
  };

  const handleSelectMonth = (value: string) => {
    const monthIndex = MONTH_LABELS.findIndex((label) => label === value);
    if (monthIndex === -1) return;

    setCurrentMonth((prev) => new Date(prev.getFullYear(), monthIndex, 1));
  };

  const handleSelectYear = (value: string) => {
    const year = Number.parseInt(value, 10);
    if (Number.isNaN(year)) return;

    setCurrentMonth((prev) => new Date(year, prev.getMonth(), 1));
  };

  const currentYear = currentMonth.getFullYear();
  const monthLabel = MONTH_LABELS[currentMonth.getMonth()];

  const yearOptions = useMemo(() => {
    const endYear = Math.max(currentYear, new Date().getFullYear() + 5);
    const years: number[] = [];

    for (let year = minYear; year <= endYear; year++) {
      years.push(year);
    }

    return years;
  }, [currentYear]);

  const showEmptyMonthMessage =
    !loading && tours && tours.length > 0 && !hasToursInCurrentMonth;

  const handleEdit = (tourId: string) => {
    setEditTourId(tourId);
  };

  const handleCloseEdit = () => {
    setEditTourId(null);
  };

  const handleDelete = (tourId: string, tourName?: string) => {
    confirm({
      message: `Are you sure you want to delete ${tourName || 'this tour'}?`,
      options: confirmOptions,
    })
      .then(() => {
        setDeletingTourId(tourId);
        removeTours({
          variables: {
            ids: [tourId],
          },
          onError: (error: ApolloError) => {
            setDeletingTourId(null);
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          },
          onCompleted: () => {
            setDeletingTourId(null);
            toast({
              title: 'Success',
              description: 'Tour deleted successfully',
              variant: 'success',
            });
          },
        });
      })
      .catch(() => null);
  };

  return (
    <div className="flex overflow-hidden flex-col rounded-md border bg-sidebar">
      <div className="flex gap-2 justify-between items-center px-4 py-2 border-b bg-sidebar">
        <div className="text-sm font-medium">Tours calendar</div>

        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleChangeMonth('prev')}
          >
            <IconChevronLeft size={16} />
          </Button>

          <Select value={monthLabel} onValueChange={handleSelectMonth}>
            <Select.Trigger className="w-[110px]">{monthLabel}</Select.Trigger>
            <Select.Content>
              {MONTH_LABELS.map((label) => (
                <Select.Item key={label} value={label}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <Select value={String(currentYear)} onValueChange={handleSelectYear}>
            <Select.Trigger className="w-[90px]">{currentYear}</Select.Trigger>
            <Select.Content>
              {yearOptions.map((year) => (
                <Select.Item key={year} value={String(year)}>
                  {year}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleChangeMonth('next')}
          >
            <IconChevronRight size={16} />
          </Button>
        </div>
      </div>

      {showEmptyMonthMessage ? (
        <div className="flex justify-center items-center px-6 py-10 bg-background">
          <div className="inline-flex flex-1 justify-center items-center px-4 py-3 max-w-xl text-sm text-center rounded-md border border-dashed bg-background text-muted-foreground">
            No tours start in {monthLabel} {currentYear}.
          </div>
        </div>
      ) : (
        <ScrollArea className="h-full bg-background" type="hover">
          <div className="min-w-max bg-background">
            <div
              className="grid sticky top-0 z-30 text-xs border-b bg-background text-muted-foreground"
              style={{
                gridTemplateColumns: `220px repeat(${days.length}, 80px)`,
              }}
            >
              <div className="sticky left-0 z-40 px-3 py-2 font-medium border-r bg-background text-foreground">
                Tours
              </div>

              {days.map((day) => {
                const [datePart, weekdayPart] = day.label.split(',');

                return (
                  <div
                    key={day.iso}
                    className={cn(
                      'px-2 py-1 text-center border-r bg-background',
                      day.iso === todayIso &&
                        'bg-primary/5 text-primary font-semibold',
                    )}
                  >
                    <div className="text-[11px] font-medium leading-tight">
                      {datePart}
                    </div>

                    {weekdayPart && (
                      <div className="text-[11px] text-muted-foreground leading-tight">
                        {weekdayPart.trim()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="divide-y bg-background">
              {loading && (
                <div className="flex justify-center items-center py-10">
                  <Spinner />
                </div>
              )}

              {!loading && (!tours || tours.length === 0) && (
                <div className="flex justify-center items-center py-10 text-sm text-muted-foreground">
                  No tours to display
                </div>
              )}
              {visibleRows.map((tour: ITour) => (
                <div
                  key={tour._id}
                  className="grid min-h-[40px]"
                  style={{
                    gridTemplateColumns: `220px repeat(${days.length}, 80px)`,
                  }}
                >
                  <div className="flex isolate sticky left-0 z-20 gap-2 justify-between items-center px-3 py-2 text-sm border-r bg-background hover:bg-muted/40">
                    <span className="px-1 truncate rounded hover:bg-muted/40">
                      {tour.name || '-'}
                    </span>
                    <TourCalendarRowActions
                      deleting={deletingTourId === tour._id}
                      onEdit={() => handleEdit(tour._id)}
                      onDelete={() => handleDelete(tour._id, tour.name)}
                    />
                  </div>

                  {days.map((day) => {
                    const isInRange = isDateInRange(
                      day.date,
                      tour.startDate,
                      tour.endDate,
                    );

                    return (
                      <div
                        key={day.iso}
                        className={cn(
                          'border-r border-t relative bg-background transition-colors',
                          isInRange && 'bg-primary/10 hover:bg-primary/20',
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <ScrollArea.Bar orientation="horizontal" className="z-10" />
        </ScrollArea>
      )}

      <Sheet open={!!editTourId} onOpenChange={handleCloseEdit}>
        <Sheet.View className="w-[800px] sm:max-w-[800px] p-0">
          {editTourId && (
            <TourEditForm
              tourId={editTourId}
              branchId={branchId}
              onSuccess={handleCloseEdit}
            />
          )}
        </Sheet.View>
      </Sheet>
    </div>
  );
};

import type { RepeatRule } from '@erxes/core-contract';
import { parseISO } from 'date-fns';
import { useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { weekdayDate } from './repeatDraft';

/** A rule in plain words: "Every 2 weeks on Mon, Thu at 09:00, 10 times". */
export const useDescribeRepeat = () => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();

  /** A weekday's short name in the member's language. */
  const weekdayName = (weekday: number) => fmt.date(weekdayDate(weekday), 'EEE');

  const period = (rule: RepeatRule) => {
    const count = rule.interval ?? 1;

    switch (rule.frequency) {
      case 'day':
        return t('repeat.every-days', 'Every {{count}} days', { count });
      case 'week':
        return t('repeat.every-weeks', 'Every {{count}} weeks on {{days}}', {
          count,
          days: (rule.weekdays ?? []).map(weekdayName).join(', '),
        });
      case 'month':
        return rule.dayOfMonth === 31
          ? t('repeat.every-months-last', 'Every {{count}} months on the last day', { count })
          : t('repeat.every-months', 'Every {{count}} months on day {{day}}', {
              count,
              day: rule.dayOfMonth ?? 1,
            });
    }
  };

  const end = (rule: RepeatRule) => {
    if (rule.endsOn) {
      return t('repeat.until', ', until {{date}}', { date: fmt.date(parseISO(rule.endsOn)) });
    }

    return rule.maxRuns ? t('repeat.times', ', {{count}} times', { count: rule.maxRuns }) : '';
  };

  return (rule: RepeatRule) => {
    const [hour = 0, minute = 0] = rule.at.split(':').map(Number);
    const time = fmt.time(new Date(2024, 0, 1, hour, minute));

    return `${period(rule)} ${t('repeat.at', 'at {{time}}', { time })}${end(rule)}`;
  };
};

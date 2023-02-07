import { __ } from '@erxes/ui/src/utils';

export const SUBMENU = [{ title: __('Plans'), link: '/pricing/plans' }];

export const STATUS_FILTER_OPTIONS = ['active', 'archived', 'completed'];

export const RULE_OPTIONS = [
  {
    label: 'Exact',
    value: 'exact'
  },
  {
    label: 'Every',
    value: 'every'
  },
  {
    label: 'Minimum',
    value: 'minimum'
  }
];

export const DISCOUNT_OPTIONS = [
  {
    label: 'Default',
    value: 'default'
  },
  {
    label: 'Fixed',
    value: 'fixed'
  },
  {
    label: 'Subtraction',
    value: 'subtraction'
  },
  {
    label: 'Percentage',
    value: 'percentage'
  },
  {
    label: 'Bonus',
    value: 'bonus'
  }
];

export const WEEK_OPTIONS = [
  {
    label: 'Monday',
    value: '1'
  },
  {
    label: 'Tuesday',
    value: '2'
  },
  {
    label: 'Wednesday',
    value: '3'
  },
  {
    label: 'Thursday',
    value: '4'
  },
  {
    label: 'Friday',
    value: '5'
  },
  {
    label: 'Saturday',
    value: '6'
  },
  {
    label: 'Sunday',
    value: '0'
  }
];

export const REPEAT_OPTIONS = [
  {
    label: 'Every Day',
    value: 'everyDay'
  },
  {
    label: 'Every Week',
    value: 'everyWeek'
  },
  {
    label: 'Every Month',
    value: 'everyMonth'
  },
  {
    label: 'Every Year',
    value: 'everyYear'
  }
];

export const DATE_OPTIONS = [
  {
    label: 'Hour',
    value: 'hour'
  },
  {
    label: 'Day',
    value: 'day'
  },
  {
    label: 'Week',
    value: 'week'
  },
  {
    label: 'Month',
    value: 'month'
  },
  {
    label: 'Year',
    value: 'year'
  }
];

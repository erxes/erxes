const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const NUMBER = /^\d+$/;

const pad = (n: string) => n.padStart(2, '0');

// Weekday field as names, for plain lists and ranges of numbers.
const weekdays = (field: string) => {
  const names = field.split(',').map((part) => {
    const [from, to] = part.split('-');
    const name = (day: string) => DAYS[Number(day) % 7];

    if (!NUMBER.test(from) || (to !== undefined && !NUMBER.test(to))) {
      return undefined;
    }

    return to === undefined ? name(from) : `${name(from)}-${name(to)}`;
  });

  return names.every(Boolean) ? names.join(', ') : undefined;
};

// The common shapes of a five-field UTC cron in words. Anything else is
// shown as the expression alone, which the caller always shows too.
export const describeCron = (cron: string) => {
  const [minute, hour, day, month, weekday] = cron.trim().split(/\s+/);
  const everyMinutes = /^\*\/(\d+)$/.exec(minute)?.[1];
  const anyDay = day === '*' && month === '*';

  if (everyMinutes && hour === '*' && anyDay && weekday === '*') {
    return `Every ${everyMinutes} minutes`;
  }

  if (!NUMBER.test(minute)) {
    return undefined;
  }

  if (hour === '*' && anyDay && weekday === '*') {
    return `Every hour at minute ${minute}`;
  }

  if (!NUMBER.test(hour)) {
    return undefined;
  }

  const time = `${pad(hour)}:${pad(minute)} UTC`;

  if (anyDay && weekday === '*') {
    return `Every day at ${time}`;
  }

  if (anyDay) {
    const days = weekdays(weekday);
    return days ? `${days} at ${time}` : undefined;
  }

  if (NUMBER.test(day) && month === '*' && weekday === '*') {
    return `Day ${day} of every month at ${time}`;
  }

  return undefined;
};

import dayjs from 'dayjs';
import { groupActivitySlots } from '../utils/groupActivitySlots';

const SLOT_MINUTES = 5;
const slotOf = (date: dayjs.Dayjs) =>
  Math.floor(date.valueOf() / (SLOT_MINUTES * 60_000));

describe('groupActivitySlots', () => {
  // A Wednesday, in the viewer's local time
  const now = dayjs('2026-11-04T15:00:00').valueOf();

  it('fills every day of the window, oldest first', () => {
    const { days } = groupActivitySlots([], SLOT_MINUTES, 3, now);

    expect(days.map((day) => day.date)).toEqual([
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
    ]);
    expect(days.every((day) => day.minutes === 0)).toBe(true);
  });

  it('sums minutes per local day and keeps the first and last moment', () => {
    const nine = dayjs('2026-11-04T09:00:00');
    const slots = [
      slotOf(nine),
      slotOf(nine.add(5, 'minute')),
      slotOf(nine.add(8, 'hour')),
    ];

    const { days, totalMinutes, activeDays } = groupActivitySlots(
      slots,
      SLOT_MINUTES,
      3,
      now,
    );
    const today = days[2];

    expect(today.minutes).toBe(15);
    expect(today.firstAt).toBe(nine.valueOf());
    expect(today.lastAt).toBe(nine.add(8, 'hour').add(5, 'minute').valueOf());
    expect(totalMinutes).toBe(15);
    expect(activeDays).toBe(1);
  });

  it('places activity on a Monday-first weekday × hour grid', () => {
    const mondayTen = dayjs('2026-11-02T10:30:00');
    const { heatmap } = groupActivitySlots(
      [slotOf(mondayTen)],
      SLOT_MINUTES,
      3,
      now,
    );

    expect(heatmap[0][10]).toBe(5);
    expect(heatmap.flat().reduce((a, b) => a + b, 0)).toBe(5);
  });

  it('ignores slots outside the window', () => {
    const old = dayjs('2026-10-01T10:00:00');
    const { totalMinutes } = groupActivitySlots(
      [slotOf(old)],
      SLOT_MINUTES,
      3,
      now,
    );

    expect(totalMinutes).toBe(0);
  });
});

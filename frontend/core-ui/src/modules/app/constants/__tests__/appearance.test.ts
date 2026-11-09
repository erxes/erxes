import {
  isFrameColor,
  resolveFrameStyle,
  seasonalFrameTheme,
} from '../appearance';

it('picks the seasonal theme from the calendar', () => {
  expect(seasonalFrameTheme(new Date(2026, 11, 14))).toBe('erxes');
  expect(seasonalFrameTheme(new Date(2026, 11, 15))).toBe('new-year');
  expect(seasonalFrameTheme(new Date(2027, 0, 10))).toBe('new-year');
  expect(seasonalFrameTheme(new Date(2027, 0, 11))).toBe('erxes');
  expect(seasonalFrameTheme(new Date(2027, 2, 1))).toBe('march-8');
  expect(seasonalFrameTheme(new Date(2027, 2, 11))).toBe('erxes');
});

it('resolves seasonal to that theme and rejects unknown colors', () => {
  expect(resolveFrameStyle('seasonal', new Date(2027, 2, 8)).effect).toBe(
    'petals',
  );
  expect(resolveFrameStyle('graphite').effect).toBeUndefined();
  expect(isFrameColor('seasonal')).toBe(true);
  expect(isFrameColor('toString')).toBe(false);
});

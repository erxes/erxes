import { overviewGridLayout, overviewRowHeight } from '../overviewLayout';
import { model } from './fixtures';

const models = Array.from({ length: 6 }, (_, index) => ({
  ...model,
  _id: String(index),
  labelPlural: String(index),
}));

it('spreads objects across three staggered columns in catalog order', () => {
  const positions = overviewGridLayout(models, 336);
  expect(models.map(({ _id }) => positions[_id])).toEqual([
    { x: 0, y: 0 },
    { x: 336, y: 48 },
    { x: 672, y: 0 },
    { x: 0, y: 336 },
    { x: 336, y: 384 },
    { x: 672, y: 336 },
  ]);
});

it('keeps partial rows in the same columns instead of turning them into a hierarchy', () => {
  const full = overviewGridLayout(models, 336);
  expect(overviewGridLayout(models.slice(0, 2), 336)).toEqual({
    '0': full['0'],
    '1': full['1'],
  });
});

it('handles an empty overview', () => {
  expect(overviewGridLayout([], 336)).toEqual({});
});

it('keeps expanded cards separated and initial positions aligned to the snap grid', () => {
  const height = overviewRowHeight([256, 700]);
  const positions = overviewGridLayout(models, height);
  expect(positions['3'].y - positions['0'].y).toBeGreaterThanOrEqual(764);
  expect(positions['4'].y - positions['1'].y).toBeGreaterThanOrEqual(764);
  for (const position of Object.values(positions)) {
    expect(position.x % 24).toBe(0);
    expect(position.y % 24).toBe(0);
  }
});

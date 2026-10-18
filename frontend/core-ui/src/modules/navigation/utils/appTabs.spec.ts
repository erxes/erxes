import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import {
  closeAppTab,
  getDefaultAppTabIds,
  moveAppTab,
  openAppTab,
  resolveAppTabIds,
} from '@/navigation/utils/appTabs';

const activity = (
  id: string,
  kind: INavigationActivity['kind'],
): INavigationActivity => ({
  id,
  label: id,
  kind,
  defaultPath: id,
  modules: [],
});

const activities = [
  activity('sales', 'plugin'),
  activity('frontline', 'plugin'),
  activity('core:contacts', 'core'),
];

describe('app tabs', () => {
  it('opens every plugin by default', () => {
    expect(getDefaultAppTabIds(activities)).toEqual(['sales', 'frontline']);
    expect(resolveAppTabIds(null, activities)).toEqual(['sales', 'frontline']);
  });

  it('drops stored tabs whose app is gone', () => {
    expect(
      resolveAppTabIds(['core:contacts', 'removed', 'sales'], activities),
    ).toEqual(['core:contacts', 'sales']);
  });

  it('opens a tab once, at the end', () => {
    expect(openAppTab(['sales'], 'core:contacts')).toEqual([
      'sales',
      'core:contacts',
    ]);
    expect(openAppTab(['sales'], 'sales')).toEqual(['sales']);
  });

  it('hands focus to the right neighbour, else the left one', () => {
    expect(closeAppTab(['a', 'b', 'c'], 'b')).toEqual({
      tabIds: ['a', 'c'],
      neighbourId: 'c',
    });
    expect(closeAppTab(['a', 'b', 'c'], 'c')).toEqual({
      tabIds: ['a', 'b'],
      neighbourId: 'b',
    });
    expect(closeAppTab(['a'], 'a')).toEqual({
      tabIds: [],
      neighbourId: undefined,
    });
  });

  it('moves a tab to another tab position', () => {
    expect(moveAppTab(['a', 'b', 'c'], 'a', 'c')).toEqual(['b', 'c', 'a']);
    expect(moveAppTab(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b']);
    expect(moveAppTab(['a', 'b'], 'a', 'missing')).toEqual(['a', 'b']);
  });
});

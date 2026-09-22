import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import {
  getPromotedNavigationRank,
  isPromotedNavigationActivity,
  splitPromotedNavigationActivities,
} from '@/navigation/utils/promotedNavigationActivities';

const activity = (
  defaultPath: string,
  id = defaultPath,
): INavigationActivity => ({
  id,
  label: id,
  kind: 'plugin',
  modules: [],
  defaultPath,
});

describe('promoted navigation activities', () => {
  it('ranks Command before AI Agent', () => {
    expect(getPromotedNavigationRank(activity('cf-os'))).toBe(0);
    expect(getPromotedNavigationRank(activity('erxes-agent'))).toBe(1);
    expect(getPromotedNavigationRank(activity('/cf-os/'))).toBe(0);
  });

  it('leaves other plugins unpromoted', () => {
    expect(isPromotedNavigationActivity(activity('sales'))).toBe(false);
    expect(isPromotedNavigationActivity(activity('erxes-agent/agents'))).toBe(
      false,
    );
  });

  it('pulls Command and AI Agent out of the plugin list and sorts them', () => {
    const sales = activity('sales');
    const agent = activity('erxes-agent', 'AI Agent');
    const command = activity('cf-os', 'command');
    const operation = activity('operation');

    expect(
      splitPromotedNavigationActivities([sales, agent, command, operation]),
    ).toEqual({
      promoted: [command, agent],
      rest: [sales, operation],
    });
  });

  it('keeps the full plugin list when neither product is loaded', () => {
    const sales = activity('sales');
    const operation = activity('operation');

    expect(splitPromotedNavigationActivities([sales, operation])).toEqual({
      promoted: [],
      rest: [sales, operation],
    });
  });
});

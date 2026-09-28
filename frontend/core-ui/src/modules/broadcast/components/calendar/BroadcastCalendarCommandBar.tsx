import { CommandBar, Separator } from 'erxes-ui';
import { Can } from 'ui-modules';
import {
  isRangePast,
  rangeDays,
  rangeLabel,
  TDayRange,
} from '../../utils/calendarMonth';
import { BroadcastMethod } from '../list/BroadcastMethod';
import { useTranslation } from 'react-i18next';

export const BroadcastCalendarCommandBar = ({
  range,
  onClear,
}: {
  range?: TDayRange;
  onClear: () => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const days = range ? rangeDays(range) : 0;
  const past = !!range && isRangePast(range);

  return (
    <CommandBar open={!!range}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={onClear}>
          {range && (
            <>
              {rangeLabel(range)}
              <span className="text-muted-foreground">
                {' · '}
                {t('calendar.days', { count: days })}
              </span>
            </>
          )}
        </CommandBar.Value>
        <Separator.Inline />

        {/* Days that have gone cannot be planned into, and saying so is
            better than a button that fails at the end of the form. */}
        {past ? (
          <span className="px-2 text-sm text-muted-foreground">
            {t('calendar.days-passed')}
          </span>
        ) : (
          <Can action="broadcastCreate">
            <BroadcastMethod onSelect={() => undefined} />
          </Can>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};

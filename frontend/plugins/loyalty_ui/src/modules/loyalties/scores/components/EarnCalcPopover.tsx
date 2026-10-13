import { Popover } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TEarnBreakdownItem } from '../types/earnCalc';
import {
  earnCalcSteps,
  formatCalcMoney,
  formatCalcNumber,
} from '../utils/earnCalcSteps';

/**
 * Why an earning came to the points it did: each row's arithmetic, then the
 * rounding and what the points are worth to spend.
 */
export const EarnCalcPopover = ({
  breakdown,
  total,
  children,
}: {
  breakdown: TEarnBreakdownItem[];
  total: number;
  children: ReactNode;
}) => {
  const { t } = useTranslation('loyalty');
  const raw = breakdown.reduce((sum, { points }) => sum + points, 0);
  const pointValue = breakdown.find(({ calc }) => calc?.pointValue)?.calc
    ?.pointValue;

  return (
    <Popover>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Content className="w-80 p-0 text-sm" align="start">
        <div className="border-b px-3 py-2 font-medium">
          {t('earn-calc-title')}
        </div>
        <div className="flex flex-col gap-3 px-3 py-2">
          {breakdown.map(({ rowKey, name, points, calc }) => (
            <div key={rowKey} className="flex flex-col gap-0.5">
              <div className="flex justify-between gap-2">
                <span className="truncate">
                  {name}
                  {calc?.column === 'none' && (
                    <span className="text-muted-foreground">
                      {' '}
                      ({t('earn-calc-no-tier')})
                    </span>
                  )}
                </span>
                <b className="tabular-nums">{formatCalcNumber(points)}</b>
              </div>
              {calc ? (
                earnCalcSteps(calc, t).map((step) => (
                  <span
                    key={step}
                    className="text-xs tabular-nums text-muted-foreground"
                  >
                    {step}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  {t('earn-calc-missing')}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-0.5 border-t px-3 py-2 text-xs">
          {Math.abs(raw - total) > 1e-9 && (
            <span className="text-muted-foreground">
              {t('earn-calc-rounded', {
                raw: formatCalcNumber(raw),
                total: formatCalcNumber(total),
              })}
            </span>
          )}
          {pointValue !== undefined && (
            <span>
              {t('earn-calc-money', {
                points: formatCalcNumber(total),
                amount: formatCalcMoney(total * pointValue),
              })}
            </span>
          )}
        </div>
      </Popover.Content>
    </Popover>
  );
};

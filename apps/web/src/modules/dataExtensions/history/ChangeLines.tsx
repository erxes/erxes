import type { DataExtensionChange } from '@erxes/core-contract';
import { cn } from 'erxes-ui';
import { Trans, useTranslation } from 'react-i18next';
import { useValueText } from '../form/valueText';

type Change = DataExtensionChange['changes'][number];

/** "Changed Tier from — to gold", one line per value a write changed. */
export const ChangeLines = ({ changes, className }: { changes: Change[]; className?: string }) => {
  const { t } = useTranslation('data', { keyPrefix: 'history' });
  const text = useValueText();

  if (!changes.length) return null;

  return (
    <ul
      className={cn(
        'flex flex-col gap-0.5 rounded-md bg-muted/60 px-2.5 py-1.5 text-xs',
        className,
      )}
    >
      {changes.map((change) => (
        <li key={change.fieldId} className="text-muted-foreground">
          <Trans
            t={t}
            i18nKey="changed"
            defaults="Changed <b>{{label}}</b> from {{from}} to <b>{{to}}</b>"
            values={{
              label: change.label,
              from: text({ type: change.type }, change.from),
              to: text({ type: change.type }, change.to),
            }}
            components={{ b: <span className="font-medium text-foreground" /> }}
          />
        </li>
      ))}
    </ul>
  );
};

import { IconInfoCircle } from '@tabler/icons-react';
import { Button, isDefined, Popover, TextOverflowTooltip } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PosCoverDetailQuery } from '~/gql/graphql';
import { CoverTerminalResults } from './CoverTerminalResults';

export type CoverPaymentDetail = NonNullable<
  NonNullable<
    NonNullable<PosCoverDetailQuery['posCoverDetail']>['details']
  >[number]
>;

export const CoverPaidType = ({ detail }: { detail: CoverPaymentDetail }) => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);
  const paidType = detail.paidType || '';
  if (!detail.terminalResults?.some(isDefined)) {
    return <TextOverflowTooltip value={paidType} />;
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          onMouseEnter={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          onClick={(event) => {
            event.preventDefault();
            setOpen(true);
          }}
          tabIndex={0}
          aria-label={t('cover-terminal-results-for', { paidType })}
          className="h-auto min-w-0 max-w-full cursor-help gap-1 p-0 font-normal hover:bg-transparent"
        >
          <span className="truncate decoration-dotted underline underline-offset-4">
            {paidType}
          </span>
          <IconInfoCircle className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        onOpenAutoFocus={(event) => event.preventDefault()}
        side="right"
        className="w-[420px] max-w-[calc(100vw-2rem)] max-h-[60vh] overflow-auto border bg-background p-3 text-foreground shadow-md"
      >
        <CoverTerminalResults details={[detail]} />
      </Popover.Content>
    </Popover>
  );
};

import type { AssistantRecord, AssistantRecordType } from '@erxes/core-contract';
import {
  IconBolt,
  IconBuilding,
  IconLinkOff,
  IconPackage,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { badgeVariants, cn } from 'erxes-ui';
import { createContext, type ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { orpc } from '~/lib/api';
import { recordPath } from './recordPages';

const CHIP = 'mx-0.5 max-w-full align-middle';

const InTable = createContext(false);

export const TableChips = ({ children }: { children: ReactNode }) => (
  <InTable value>{children}</InTable>
);

export const RecordIcon = ({ type }: { type: AssistantRecordType }) => {
  const props = { 'aria-hidden': true, className: 'size-3.5 shrink-0' };

  switch (type) {
    case 'customer':
      return <IconUser {...props} />;
    case 'company':
      return <IconBuilding {...props} />;
    case 'member':
      return <IconUserCircle {...props} />;
    case 'product':
      return <IconPackage {...props} />;
    case 'automation':
      return <IconBolt {...props} />;
  }
};

export const RecordChip = ({
  type,
  id,
  label,
}: {
  type: AssistantRecordType;
  id: string;
  label: string;
}) => {
  const inTable = useContext(InTable);

  return (
    <Link
      to={recordPath(type, id)}
      title={label}
      className={cn(badgeVariants(), CHIP, inTable && 'max-w-40')}
    >
      <RecordIcon type={type} />
      <span className="truncate">{label}</span>
    </Link>
  );
};

const PendingChip = () => {
  const { t } = useTranslation('assistant');

  return (
    <span className={cn(badgeVariants({ variant: 'muted' }), CHIP)}>
      {t('reference.loading', 'Loading…')}
    </span>
  );
};

const UnavailableChip = () => {
  const { t } = useTranslation('assistant');

  return (
    <span className={cn(badgeVariants({ variant: 'muted' }), CHIP)}>
      <IconLinkOff aria-hidden className="size-3.5 shrink-0" />
      {t('reference.unavailable', 'Unavailable')}
    </span>
  );
};

const ResolvedChip = ({ record, pending }: { record?: AssistantRecord; pending: boolean }) => {
  if (pending) return <PendingChip />;

  return record?.available ? (
    <RecordChip type={record.type} id={record.id} label={record.label} />
  ) : (
    <UnavailableChip />
  );
};

export const ReferenceChip = ({ handle }: { handle: string }) => {
  const query = useQuery(orpc.assistant.reference.queryOptions({ input: { handle } }));

  return <ResolvedChip record={query.data} pending={query.isPending} />;
};

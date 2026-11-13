import { Alert } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FrontlineCard } from './FrontlineCard';

type FrontlineChartCardProps = {
  id: string;
  title: string;
  description: string;
  emptyDescription?: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
  filter: ReactNode;
  loading: boolean;
  error?: { message?: string } | null;
  errorFallback?: string;
  isEmpty?: boolean;
  children: ReactNode;
};

// Loading, error and empty states shared by every report chart card.
export const FrontlineChartCard = ({
  id,
  title,
  description,
  emptyDescription,
  colSpan,
  onColSpanChange,
  filter,
  loading,
  error,
  errorFallback,
  isEmpty,
  children,
}: Readonly<FrontlineChartCardProps>) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.report' });
  const cardProps = { id, title, colSpan, onColSpanChange };

  if (loading) {
    return (
      <FrontlineCard {...cardProps} description={description}>
        <FrontlineCard.Header filter={filter} />
        <FrontlineCard.Content>
          <FrontlineCard.Skeleton />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (error) {
    return (
      <FrontlineCard {...cardProps} description={description}>
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>
              {t('error-loading-data', 'Error loading data')}
            </Alert.Title>
            <Alert.Description>
              {error.message || errorFallback}
            </Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (isEmpty) {
    return (
      <FrontlineCard
        {...cardProps}
        description={emptyDescription ?? description}
      >
        <FrontlineCard.Header filter={filter} />
        <FrontlineCard.Content>
          <FrontlineCard.Empty />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  return (
    <FrontlineCard {...cardProps} description={description}>
      <FrontlineCard.Header filter={filter} />
      {children}
    </FrontlineCard>
  );
};

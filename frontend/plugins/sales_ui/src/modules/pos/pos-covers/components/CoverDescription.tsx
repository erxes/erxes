import { Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { PosCoverDetailQuery } from '~/gql/graphql';

type CoverDescriptionProps = Pick<
  NonNullable<PosCoverDetailQuery['posCoverDetail']>,
  'description'
>;

export const CoverDescription = ({ description }: CoverDescriptionProps) => {
  const { t } = useTranslation('sales');
  const label = t('cover-description');
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <Textarea
        aria-label={label}
        value={description || ''}
        readOnly
        rows={3}
      />
    </div>
  );
};

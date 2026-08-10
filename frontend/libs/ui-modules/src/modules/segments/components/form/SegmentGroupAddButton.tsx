import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSegment } from '../../context/SegmentProvider';
import { useSegmentGroup } from '../../context/SegmentGroupProvider';

export const SegmentGroupAddButton = () => {
  const { contentType } = useSegment();
  const { appendField } = useSegmentGroup();

  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  return (
    <Button
      className="w-full mt-4 font-mono uppercase font-semibold text-xs text-accent-foreground"
      variant="secondary"
      onClick={() =>
        appendField({
          propertyType: contentType || '',
          propertyName: '',
          propertyOperator: '',
        })
      }
    >
      <IconPlus />
      {t('add-condition')}
    </Button>
  );
};

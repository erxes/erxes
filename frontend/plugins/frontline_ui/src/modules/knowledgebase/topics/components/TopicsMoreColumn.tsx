import { IconExternalLink } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import {
  KbRowActions,
  kbMoreColumn,
} from '@/knowledgebase/shared/components/KbRowActions';
import { useConfirmRemoveTopic } from '@/knowledgebase/topics/hooks/useConfirmRemoveTopic';
import { ITopic } from '@/knowledgebase/types';

const TopicsMoreColumnCell = ({ cell }: { cell: Cell<ITopic, unknown> }) => {
  const { t } = useTranslation('frontline');
  const topic = cell.row.original;
  const navigate = useNavigate();
  const { confirmRemoveTopic } = useConfirmRemoveTopic();

  return (
    <KbRowActions
      id={topic._id}
      actions={[
        {
          value: 'open',
          icon: IconExternalLink,
          label: t('kb-open-topic', 'Open topic'),
          onSelect: () =>
            navigate(`${KNOWLEDGE_BASE_PATH}/${topic._id}/articles`),
        },
      ]}
      onDelete={() => confirmRemoveTopic(topic)}
    />
  );
};

export const topicsMoreColumn = kbMoreColumn<ITopic>(TopicsMoreColumnCell);

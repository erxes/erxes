import {
  IconCalendarPlus,
  IconFileText,
  IconFolders,
  IconHash,
  IconLabelFilled,
  IconLanguage,
  IconNotes,
  IconTag,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { TFunction } from 'i18next';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SelectBrand } from 'ui-modules';
import { countTopicArticles } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';
import { KNOWLEDGE_BASE_PATH, LANGUAGES } from '@/knowledgebase/constants';
import {
  kbColumn,
  kbCountColumn,
  kbDateColumn,
  KbTextCell,
} from '@/knowledgebase/shared/components/kbColumns';
import { useEditTopicField } from '@/knowledgebase/topics/hooks/useTopicMutations';
import { topicsMoreColumn } from '@/knowledgebase/topics/components/TopicsMoreColumn';
import { ITopic, KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';

const TextCell = ({
  cell,
  field,
  placeholder,
  children,
}: {
  cell: Cell<ITopic, unknown>;
  field: 'title' | 'description' | 'code';
  placeholder?: string;
  children?: ReactNode;
}) => {
  const { editTopicField } = useEditTopicField();

  return (
    <KbTextCell
      cell={cell}
      scope={KnowledgeBaseHotKeyScope.TopicsPage}
      field={field}
      placeholder={placeholder}
      onSave={(next) => editTopicField(cell.row.original, { [field]: next })}
    >
      {children}
    </KbTextCell>
  );
};

const TitleCell = ({
  cell,
  t,
}: {
  cell: Cell<ITopic, unknown>;
  t: TFunction;
}) => {
  const topic = cell.row.original;
  const navigate = useNavigate();

  return (
    <TextCell cell={cell} field="title" placeholder={t('unnamed-topic')}>
      <RecordTableInlineCell.Anchor
        onClick={() => navigate(`${KNOWLEDGE_BASE_PATH}/${topic._id}/articles`)}
      >
        {topic.title || t('unnamed-topic')}
      </RecordTableInlineCell.Anchor>
    </TextCell>
  );
};

const BrandCell = ({ cell }: { cell: Cell<ITopic, unknown> }) => {
  const topic = cell.row.original;
  const { editTopicField } = useEditTopicField();

  return (
    <SelectBrand.InlineCell
      scope={clsx(KnowledgeBaseHotKeyScope.TopicsPage, topic._id, 'brandId')}
      value={topic.brand?.name ? topic.brand._id : ''}
      onValueChange={(value) =>
        editTopicField(topic, { brandId: value as string })
      }
    />
  );
};

const createTopicsColumns = (t: TFunction): ColumnDef<ITopic>[] => [
  topicsMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ITopic>,
  kbColumn<ITopic>({
    id: 'title',
    size: 260,
    label: t('title-label', 'Title'),
    icon: IconLabelFilled,
    render: (cell) => <TitleCell cell={cell} t={t} />,
  }),
  kbColumn<ITopic>({
    id: 'description',
    size: 300,
    label: t('description', 'Description'),
    icon: IconNotes,
    render: (cell) => (
      <TextCell
        cell={cell}
        field="description"
        placeholder={t('kb-no-description', 'No description')}
      />
    ),
  }),
  kbCountColumn<ITopic>({
    id: 'categories',
    label: t('kb-categories', 'Categories'),
    icon: IconFolders,
    count: (topic) => (topic.categories || []).length,
  }),
  kbCountColumn<ITopic>({
    id: 'categories.numOfArticles',
    label: t('articles', 'Articles'),
    icon: IconFileText,
    count: (topic) => countTopicArticles(topic.categories || []),
  }),
  kbColumn<ITopic>({
    id: 'brandId',
    size: 200,
    label: t('brand', 'Brand'),
    icon: IconTag,
    render: (cell) => <BrandCell cell={cell} />,
  }),
  kbColumn<ITopic>({
    id: 'code',
    size: 160,
    label: t('kb-code', 'Code'),
    icon: IconHash,
    render: (cell) => (
      <TextCell cell={cell} field="code" placeholder={t('kb-code', 'Code')} />
    ),
  }),
  kbColumn<ITopic>({
    id: 'languageCode',
    size: 140,
    label: t('language', 'Language'),
    icon: IconLanguage,
    render: (cell) => {
      const code = cell.getValue() as string;
      const language = LANGUAGES.find((item) => item.value === code);

      return (
        <RecordTableInlineCell>
          {language?.label || code || '-'}
        </RecordTableInlineCell>
      );
    },
  }),
  kbDateColumn<ITopic>({
    id: 'createdDate',
    label: t('created-at', 'Created at'),
    icon: IconCalendarPlus,
  }),
];

export const useTopicsColumns = (): ColumnDef<ITopic>[] => {
  const { t } = useTranslation('frontline');

  return useMemo(() => createTopicsColumns(t), [t]);
};

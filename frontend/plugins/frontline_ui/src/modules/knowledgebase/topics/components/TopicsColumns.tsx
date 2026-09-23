import {
  IconCalendarPlus,
  IconFolders,
  IconHash,
  IconLabelFilled,
  IconLanguage,
  IconNotes,
  IconTag,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SelectBrand } from 'ui-modules';
import { KNOWLEDGE_BASE_PATH, LANGUAGES } from '@/knowledgebase/constants';
import { KbInlineTextCell } from '@/knowledgebase/shared/components/KbInlineTextCell';
import { useEditTopicField } from '@/knowledgebase/topics/hooks/useTopicMutations';
import { topicsMoreColumn } from '@/knowledgebase/topics/components/TopicsMoreColumn';
import {
  ITopic,
  ITopicDoc,
  KnowledgeBaseHotKeyScope,
} from '@/knowledgebase/types';

const cellScope = (topic: ITopic, field: string) =>
  clsx(KnowledgeBaseHotKeyScope.TopicsPage, topic._id, field);

const TextCell = ({
  cell,
  field,
  placeholder,
  children,
}: {
  cell: Cell<ITopic, unknown>;
  field: 'title' | 'description' | 'code';
  placeholder?: string;
  children?: React.ReactNode;
}) => {
  const topic = cell.row.original;
  const { editTopicField } = useEditTopicField();
  const patch = (next: string): Partial<ITopicDoc> => ({ [field]: next });

  return (
    <KbInlineTextCell
      value={(cell.getValue() as string) || ''}
      placeholder={placeholder}
      scope={cellScope(topic, field)}
      onSave={(next) => editTopicField(topic, patch(next))}
    >
      {children}
    </KbInlineTextCell>
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
      scope={cellScope(topic, 'brandId')}
      value={topic.brandId ?? topic.brand?._id ?? ''}
      onValueChange={(value) =>
        editTopicField(topic, { brandId: value as string })
      }
    />
  );
};

const createTopicsColumns = (t: TFunction): ColumnDef<ITopic>[] => [
  topicsMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ITopic>,
  {
    id: 'title',
    accessorKey: 'title',
    size: 260,
    header: () => (
      <RecordTable.InlineHead
        label={t('title-label', 'Title')}
        icon={IconLabelFilled}
      />
    ),
    cell: ({ cell }) => <TitleCell cell={cell} t={t} />,
  },
  {
    id: 'description',
    accessorKey: 'description',
    size: 300,
    header: () => (
      <RecordTable.InlineHead
        label={t('description', 'Description')}
        icon={IconNotes}
      />
    ),
    cell: ({ cell }) => (
      <TextCell
        cell={cell}
        field="description"
        placeholder={t('kb-no-description', 'No description')}
      />
    ),
  },
  {
    id: 'categories',
    accessorKey: 'categories',
    size: 140,
    header: () => (
      <RecordTable.InlineHead
        label={t('kb-categories', 'Categories')}
        icon={IconFolders}
      />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">
          {(cell.row.original.categories || []).length}
        </Badge>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'brandId',
    accessorKey: 'brandId',
    size: 200,
    header: () => (
      <RecordTable.InlineHead label={t('brand', 'Brand')} icon={IconTag} />
    ),
    cell: ({ cell }) => <BrandCell cell={cell} />,
  },
  {
    id: 'code',
    accessorKey: 'code',
    size: 160,
    header: () => (
      <RecordTable.InlineHead label={t('kb-code', 'Code')} icon={IconHash} />
    ),
    cell: ({ cell }) => (
      <TextCell cell={cell} field="code" placeholder={t('kb-code', 'Code')} />
    ),
  },
  {
    id: 'languageCode',
    accessorKey: 'languageCode',
    size: 140,
    header: () => (
      <RecordTable.InlineHead
        label={t('language', 'Language')}
        icon={IconLanguage}
      />
    ),
    cell: ({ cell }) => {
      const code = cell.getValue() as string;
      const language = LANGUAGES.find((item) => item.value === code);

      return (
        <RecordTableInlineCell>
          {language?.label || code || '-'}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdDate',
    accessorKey: 'createdDate',
    size: 160,
    header: () => (
      <RecordTable.InlineHead
        label={t('created-at', 'Created at')}
        icon={IconCalendarPlus}
      />
    ),
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];

export const useTopicsColumns = (): ColumnDef<ITopic>[] => {
  const { t } = useTranslation('frontline');

  return useMemo(() => createTopicsColumns(t), [t]);
};

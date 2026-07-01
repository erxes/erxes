import { useQuery } from '@apollo/client';
import {
  IconCards,
  IconClock,
  IconLabel,
  IconLayoutCards,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ACCOUNTING_CHECK_SYNCED_DEAL_DATE_TYPES } from '../constants/dateTypeData';
import {
  ACCOUNTING_SALES_BOARDS_QUERY,
  ACCOUNTING_SALES_PIPELINES_QUERY,
  ACCOUNTING_SALES_STAGES_QUERY,
} from '../graphql/checkSyncedDeals';

type SalesBoard = {
  _id: string;
  name: string;
};

type SalesPipeline = {
  _id: string;
  name: string;
};

type SalesStage = {
  _id: string;
  name: string;
};

type DateType = {
  value: string;
  label: string;
};

const getSelectedName = <T extends { _id: string; name: string }>(
  items: T[] | undefined,
  value: string | null,
  placeholder: string,
) => items?.find((item) => item._id === value)?.name || placeholder;

const SalesBoardContent = ({
  value,
  onValueChange,
}: {
  value: string | null;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('accounting');
  const { data, loading } = useQuery<{ salesBoards?: SalesBoard[] }>(
    ACCOUNTING_SALES_BOARDS_QUERY,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <span className="text-muted-foreground">{t('loading')}</span>
      </div>
    );
  }

  return (
    <Command>
      <Command.Input placeholder={t('search-board')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-boards-found')}</span>
      </Command.Empty>
      <Command.List>
        {(data?.salesBoards || []).map((board) => (
          <Command.Item
            key={board._id}
            value={board._id}
            onSelect={() => onValueChange(board._id)}
          >
            <span className="font-medium capitalize">{board.name}</span>
            <Combobox.Check checked={value === board._id} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const SalesPipelineContent = ({
  boardId,
  value,
  onValueChange,
}: {
  boardId?: string;
  value: string | null;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('accounting');
  const { data, loading } = useQuery<{
    salesPipelines?: { list?: SalesPipeline[] };
  }>(ACCOUNTING_SALES_PIPELINES_QUERY, {
    variables: { boardId },
    skip: !boardId,
  });

  if (!boardId) {
    return (
      <div className="flex items-center justify-center h-24">
        <span className="text-muted-foreground">{t('choose-board-first')}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <span className="text-muted-foreground">{t('loading')}</span>
      </div>
    );
  }

  return (
    <Command>
      <Command.Input placeholder={t('search-pipeline')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-pipelines-found')}</span>
      </Command.Empty>
      <Command.List>
        {(data?.salesPipelines?.list || []).map((pipeline) => (
          <Command.Item
            key={pipeline._id}
            value={pipeline._id}
            onSelect={() => onValueChange(pipeline._id)}
          >
            <span className="font-medium capitalize">{pipeline.name}</span>
            <Combobox.Check checked={value === pipeline._id} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const SalesStageContent = ({
  pipelineId,
  value,
  onValueChange,
}: {
  pipelineId?: string;
  value: string | null;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('accounting');
  const { data, loading } = useQuery<{ salesStages?: SalesStage[] }>(
    ACCOUNTING_SALES_STAGES_QUERY,
    {
      variables: { pipelineId },
      skip: !pipelineId,
    },
  );

  if (!pipelineId) {
    return (
      <div className="flex items-center justify-center h-24">
        <span className="text-muted-foreground">{t('choose-pipeline-first')}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <span className="text-muted-foreground">{t('loading')}</span>
      </div>
    );
  }

  return (
    <Command>
      <Command.Input placeholder={t('search-stage')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-stages-found')}</span>
      </Command.Empty>
      <Command.List>
        {(data?.salesStages || []).map((stage) => (
          <Command.Item
            key={stage._id}
            value={stage._id}
            onSelect={() => onValueChange(stage._id)}
          >
            <span className="font-medium capitalize">{stage.name}</span>
            <Combobox.Check checked={value === stage._id} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const DateTypeContent = ({
  value,
  onValueChange,
}: {
  value: string | null;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <Command>
      <Command.Input placeholder={t('search-date-type')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-date-types-found')}</span>
      </Command.Empty>
      <Command.List>
        {ACCOUNTING_CHECK_SYNCED_DEAL_DATE_TYPES.map((dateType: DateType) => (
          <Command.Item
            key={dateType.value}
            value={dateType.value}
            onSelect={() => onValueChange(dateType.value)}
          >
            <span className="font-medium">{t(dateType.label)}</span>
            <Combobox.Check checked={value === dateType.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const AccountingDealBoardFilterItem = () => {
  const { t } = useTranslation('accounting');
  return (
    <Filter.Item value="boardId">
      <IconLayoutCards />
      {t('board')}
    </Filter.Item>
  );
};

export const AccountingDealPipelineFilterItem = () => {
  const { t } = useTranslation('accounting');
  return (
    <Filter.Item value="pipelineId">
      <IconCards />
      {t('pipeline')}
    </Filter.Item>
  );
};

export const AccountingDealStageFilterItem = () => {
  const { t } = useTranslation('accounting');
  return (
    <Filter.Item value="stageId">
      <IconLabel />
      {t('stage')}
    </Filter.Item>
  );
};

export const AccountingDealDateTypeFilterItem = () => {
  const { t } = useTranslation('accounting');
  return (
    <Filter.Item value="dateType">
      <IconClock />
      {t('date-type')}
    </Filter.Item>
  );
};

export const AccountingDealBoardFilterView = () => {
  const [boardId, setBoardId] = useQueryState<string>('boardId');
  const [, setPipelineId] = useQueryState<string>('pipelineId');
  const [, setStageId] = useQueryState<string>('stageId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="boardId">
      <SalesBoardContent
        value={boardId}
        onValueChange={(value) => {
          setBoardId(value);
          setPipelineId(null);
          setStageId(null);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const AccountingDealPipelineFilterView = ({
  boardId,
}: {
  boardId?: string;
}) => {
  const [pipelineId, setPipelineId] = useQueryState<string>('pipelineId');
  const [, setStageId] = useQueryState<string>('stageId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="pipelineId">
      <SalesPipelineContent
        boardId={boardId}
        value={pipelineId}
        onValueChange={(value) => {
          setPipelineId(value);
          setStageId(null);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const AccountingDealStageFilterView = ({
  pipelineId,
}: {
  pipelineId?: string;
}) => {
  const [stageId, setStageId] = useQueryState<string>('stageId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="stageId">
      <SalesStageContent
        pipelineId={pipelineId}
        value={stageId}
        onValueChange={(value) => {
          setStageId(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const AccountingDealDateTypeFilterView = () => {
  const [dateType, setDateType] = useQueryState<string>('dateType');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="dateType">
      <DateTypeContent
        value={dateType}
        onValueChange={(value) => {
          setDateType(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const AccountingDealBoardFilterBar = () => {
  const { t } = useTranslation('accounting');
  const [boardId, setBoardId] = useQueryState<string>('boardId');
  const [, setPipelineId] = useQueryState<string>('pipelineId');
  const [, setStageId] = useQueryState<string>('stageId');
  const [open, setOpen] = useState(false);
  const { data } = useQuery<{ salesBoards?: SalesBoard[] }>(
    ACCOUNTING_SALES_BOARDS_QUERY,
  );

  return (
    <Filter.BarItem queryKey="boardId">
      <Filter.BarName>
        <IconLayoutCards />
        {t('board')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="boardId">
            {getSelectedName(data?.salesBoards, boardId, t('select-board'))}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <SalesBoardContent
            value={boardId}
            onValueChange={(value) => {
              setBoardId(value);
              setPipelineId(null);
              setStageId(null);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const AccountingDealPipelineFilterBar = ({
  boardId,
}: {
  boardId?: string;
}) => {
  const { t } = useTranslation('accounting');
  const [pipelineId, setPipelineId] = useQueryState<string>('pipelineId');
  const [, setStageId] = useQueryState<string>('stageId');
  const [open, setOpen] = useState(false);
  const { data } = useQuery<{ salesPipelines?: { list?: SalesPipeline[] } }>(
    ACCOUNTING_SALES_PIPELINES_QUERY,
    {
      variables: { boardId },
      skip: !boardId,
    },
  );

  return (
    <Filter.BarItem queryKey="pipelineId">
      <Filter.BarName>
        <IconCards />
        {t('pipeline')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="pipelineId">
            {boardId
              ? getSelectedName(
                  data?.salesPipelines?.list,
                  pipelineId,
                  t('select-pipeline'),
                )
              : t('choose-board-first')}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <SalesPipelineContent
            boardId={boardId}
            value={pipelineId}
            onValueChange={(value) => {
              setPipelineId(value);
              setStageId(null);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const AccountingDealStageFilterBar = ({
  pipelineId,
}: {
  pipelineId?: string;
}) => {
  const { t } = useTranslation('accounting');
  const [stageId, setStageId] = useQueryState<string>('stageId');
  const [open, setOpen] = useState(false);
  const { data } = useQuery<{ salesStages?: SalesStage[] }>(
    ACCOUNTING_SALES_STAGES_QUERY,
    {
      variables: { pipelineId },
      skip: !pipelineId,
    },
  );

  return (
    <Filter.BarItem queryKey="stageId">
      <Filter.BarName>
        <IconLabel />
        {t('stage')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="stageId">
            {pipelineId
              ? getSelectedName(data?.salesStages, stageId, t('select-stage'))
              : t('choose-pipeline-first')}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <SalesStageContent
            pipelineId={pipelineId}
            value={stageId}
            onValueChange={(value) => {
              setStageId(value);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const AccountingDealDateTypeFilterBar = () => {
  const { t } = useTranslation('accounting');
  const [dateType, setDateType] = useQueryState<string>('dateType');
  const [open, setOpen] = useState(false);
  const selectedDateType = ACCOUNTING_CHECK_SYNCED_DEAL_DATE_TYPES.find(
    (item) => item.value === dateType,
  );

  return (
    <Filter.BarItem queryKey="dateType">
      <Filter.BarName>
        <IconClock />
        {t('date-type')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="dateType">
            {selectedDateType ? t(selectedDateType.label) : t('select-date-type')}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <DateTypeContent
            value={dateType}
            onValueChange={(value) => {
              setDateType(value);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

import { useTranslation } from 'react-i18next';
import {
  IconArrowsRight,
  IconCalendar,
  IconFileDescription,
  IconLabel,
  IconListCheck,
  IconSearch,
} from '@tabler/icons-react';

import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { ScoreHotKeyScope } from '../types/path/ScoreHotKeyScope';
import { ScoreTotalCount } from './ScoreTotalCount';
import { useScoreLeadSessionKey } from '../hooks/useScoreLeadSessionKey';
import { SelectScoreCampaign } from './selects/SelectScoreCampaign';
import { SelectOwnerType } from './selects/SelectOwnerType';
import { SelectScoreAction } from './selects/SelectScoreAction';
import {
  SelectScoreActionTypeFilterBar,
  SelectScoreActionTypeFilterItem,
  SelectScoreActionTypeFilterView,
} from './selects/SelectScoreActionType';
import { SelectOwner } from '~/modules/loyalties/components/SelectOwner';

const ScoreFilterPopover = () => {
  const { t } = useTranslation('loyalty');
  const [scoreBoardId] = useFilterQueryState<string>('scoreBoardId');
  const [scorePipelineId] = useFilterQueryState<string>('scorePipelineId');
  const [, setPipelineId] = useQueryState<string>('scorePipelineId');
  const [, setStageId] = useQueryState<string>('scoreStageId');
  const [queries] = useMultiQueryState<{
    scoreOwnerType: string;
    scoreOwnerId: string;
    scoreCampaignId: string;
    scoreDate: string;
    scoreOrderType: string;
    scoreAction: string;
    number: string;
    description: string;
    scoreBoardId: string;
    scorePipelineId: string;
    scoreStageId: string;
  }>([
    'scoreOwnerType',
    'scoreOwnerId',
    'scoreCampaignId',
    'scoreDate',
    'scoreOrderType',
    'scoreAction',
    'number',
    'description',
    'scoreBoardId',
    'scorePipelineId',
    'scoreStageId',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={ScoreHotKeyScope.ScorePage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <SelectScoreCampaign.FilterItem />
                <SelectOwnerType.FilterItem />
                <SelectOwner.FilterItem queryKey="scoreOwnerId" />
                <SelectScoreAction.FilterItem />
                <Filter.Item value="scoreBoardId">
                  <IconLabel />
                  {t('board')}
                </Filter.Item>
                <Filter.Item value="scorePipelineId">
                  <IconArrowsRight />
                  {t('pipeline')}
                </Filter.Item>
                <Filter.Item value="scoreStageId">
                  <IconListCheck />
                  {t('stage')}
                </Filter.Item>
                <Filter.Item value="number" inDialog>
                  <IconSearch />
                  {t('number')}
                </Filter.Item>
                <Filter.Item value="description" inDialog>
                  <IconFileDescription />
                  {t('description')}
                </Filter.Item>
                <SelectScoreActionTypeFilterItem />
                <Filter.Item value="scoreDate">
                  <IconCalendar />
                  {t('date')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectScoreCampaign.FilterView />
          <SelectOwnerType.FilterView />
          <SelectOwner.FilterView
            queryKey="scoreOwnerId"
            ownerTypeKey="scoreOwnerType"
          />
          <SelectScoreAction.FilterView />
          <SelectScoreActionTypeFilterView />
          <SelectBoard.FilterView
            queryKey="scoreBoardId"
            onValueChange={() => {
              setPipelineId(null);
              setStageId(null);
            }}
          />
          <SelectPipeline.FilterView
            queryKey="scorePipelineId"
            boardId={scoreBoardId || undefined}
          />
          <SelectStage.FilterView
            queryKey="scoreStageId"
            pipelineId={scorePipelineId || undefined}
          />
          <Filter.View filterKey="scoreDate">
            <Filter.DateView filterKey="scoreDate" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="scoreCampaignId" inDialog>
          <SelectScoreCampaign.FilterView />
        </Filter.View>
        <Filter.View filterKey="scoreOwnerType" inDialog>
          <SelectOwnerType.FilterView />
        </Filter.View>
        <Filter.View filterKey="scoreOwnerId" inDialog>
          <SelectOwner.FilterView
            queryKey="scoreOwnerId"
            ownerTypeKey="scoreOwnerType"
          />
        </Filter.View>
        <Filter.View filterKey="number" inDialog>
          <Filter.DialogStringView filterKey="number" />
        </Filter.View>
        <Filter.View filterKey="description" inDialog>
          <Filter.DialogStringView filterKey="description" />
        </Filter.View>
        <Filter.View filterKey="scoreDate" inDialog>
          <Filter.DialogDateView filterKey="scoreDate" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const ScoreFilter = () => {
  const { t } = useTranslation('loyalty');
  const { sessionKey } = useScoreLeadSessionKey();
  const [number] = useFilterQueryState<string>('number');
  const [description] = useFilterQueryState<string>('description');
  const [scoreBoardId] = useFilterQueryState<string>('scoreBoardId');
  const [scorePipelineId] = useFilterQueryState<string>('scorePipelineId');

  return (
    <Filter id="score-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <SelectScoreCampaign.FilterBar />
        <SelectOwnerType.FilterBar />
        <SelectOwner.FilterBar
          queryKey="scoreOwnerId"
          ownerTypeKey="scoreOwnerType"
        />
        <SelectBoard.FilterBar queryKey="scoreBoardId" />
        <SelectPipeline.FilterBar
          queryKey="scorePipelineId"
          boardId={scoreBoardId || undefined}
        />
        <SelectStage.FilterBar
          queryKey="scoreStageId"
          pipelineId={scorePipelineId || undefined}
        />
        <Filter.BarItem queryKey="number">
          <Filter.BarName>
            <IconSearch />
            {t('number')}
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="description">
          <Filter.BarName>
            <IconFileDescription />
            {t('description')}
          </Filter.BarName>
          <Filter.BarButton filterKey="description" inDialog>
            {description}
          </Filter.BarButton>
        </Filter.BarItem>
        <SelectScoreAction.FilterBar />
        <SelectScoreActionTypeFilterBar />
        <Filter.BarItem queryKey="scoreDate">
          <Filter.BarName>
            <IconCalendar />
            {t('date')}
          </Filter.BarName>
          <Filter.Date filterKey="scoreDate" />
        </Filter.BarItem>
        <ScoreFilterPopover />
        <ScoreTotalCount />
      </Filter.Bar>
    </Filter>
  );
};

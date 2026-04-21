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
import { ScoreTotalCount } from './ScoreTotalCount';
import {
  SelectScoreCampaignFilterItem,
  SelectScoreCampaignFilterView,
  SelectScoreCampaignFilterBar,
} from './selects/SelectScoreCampaign';
import {
  SelectOwnerTypeFilterItem,
  SelectOwnerTypeFilterView,
  SelectOwnerTypeFilterBar,
} from './selects/SelectOwnerType';
import {
  SelectScoreCustomerFilterView,
  SelectScoreCustomerFilterBar,
} from './selects/SelectCustomer';
import {
  SelectScoreActionFilterItem,
  SelectScoreActionFilterView,
  SelectScoreActionFilterBar,
} from './selects/SelectScoreAction';
import {
  SelectScoreActionTypeFilterItem,
  SelectScoreActionTypeFilterView,
  SelectScoreActionTypeFilterBar,
} from './selects/SelectScoreActionType';

export const SCORE_FILTER_SESSION_KEY = 'score_filter';

const ScoreFilterPopover = () => {
  const [scoreBoardId] = useFilterQueryState<string>('scoreBoardId');
  const [scorePipelineId] = useFilterQueryState<string>('scorePipelineId');
  const [, setPipelineId] = useQueryState<string>('scorePipelineId');
  const [, setStageId] = useQueryState<string>('scoreStageId');
  const [queries] = useMultiQueryState<{
    scoreOwnerType: string | null;
    scoreOwnerId: string | null;
    scoreCampaignId: string | null;
    scoreDate: string | null;
    scoreOrderType: string | null;
    scoreAction: string | null;
    number: string | null;
    description: string | null;
    scoreBoardId: string | null;
    scorePipelineId: string | null;
    scoreStageId: string | null;
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

  const hasFilters = Object.values(queries || {}).some((v) => v !== null);

  return (
    <>
      <Filter.Popover>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <SelectScoreCampaignFilterItem />
                <SelectOwnerTypeFilterItem />
                <SelectScoreActionFilterItem />
                <Filter.Item value="scoreBoardId">
                  <IconLabel />
                  Board
                </Filter.Item>
                <Filter.Item value="scorePipelineId">
                  <IconArrowsRight />
                  Pipeline
                </Filter.Item>
                <Filter.Item value="scoreStageId">
                  <IconListCheck />
                  Stage
                </Filter.Item>
                <Filter.Item value="number" inDialog>
                  <IconSearch />
                  Number
                </Filter.Item>
                <Filter.Item value="description" inDialog>
                  <IconFileDescription />
                  Description
                </Filter.Item>
                <SelectScoreActionTypeFilterItem />
                <Filter.Item value="scoreDate">
                  <IconCalendar />
                  Date
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>

          <SelectScoreCampaignFilterView />
          <SelectOwnerTypeFilterView />
          <SelectScoreCustomerFilterView />
          <SelectScoreActionFilterView />
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
          <SelectScoreCampaignFilterView queryKey="scoreCampaignId" />
        </Filter.View>
        <Filter.View filterKey="scoreOwnerType" inDialog>
          <SelectOwnerTypeFilterView queryKey="scoreOwnerType" />
        </Filter.View>
        <Filter.View filterKey="scoreOwnerId" inDialog>
          <SelectScoreCustomerFilterView queryKey="scoreOwnerId" />
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
  const [number] = useFilterQueryState<string>('number');
  const [description] = useFilterQueryState<string>('description');
  const [scoreBoardId] = useFilterQueryState<string>('scoreBoardId');
  const [scorePipelineId] = useFilterQueryState<string>('scorePipelineId');

  return (
    <Filter id="score-filter" sessionKey={SCORE_FILTER_SESSION_KEY}>
      <Filter.Bar>
        <SelectScoreCampaignFilterBar />
        <SelectOwnerTypeFilterBar />
        <SelectScoreCustomerFilterBar />
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
            Number
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="description">
          <Filter.BarName>
            <IconSearch />
            Description
          </Filter.BarName>
          <Filter.BarButton filterKey="description" inDialog>
            {description}
          </Filter.BarButton>
        </Filter.BarItem>
        <SelectScoreActionFilterBar />
        <SelectScoreActionTypeFilterBar />
        <Filter.BarItem queryKey="scoreDate">
          <Filter.BarName>
            <IconCalendar />
            Date
          </Filter.BarName>
          <Filter.Date filterKey="scoreDate" />
        </Filter.BarItem>
        <ScoreFilterPopover />
        <ScoreTotalCount />
      </Filter.Bar>
    </Filter>
  );
};

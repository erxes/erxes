import {
  IconCalendar,
  IconFileDescription,
  IconSearch,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';
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
import {
  SelectBoardFilterItem,
  SelectBoardFilterView,
  SelectBoardFilterBar,
  SelectPipelineFilterItem,
  SelectPipelineFilterView,
  SelectPipelineFilterBar,
  SelectStageFilterItem,
  SelectStageFilterView,
  SelectStageFilterBar,
} from './selects/SelectTarget';
import { useGetSalesBoards } from '../hooks/useGetSalesBoards';

export const SCORE_FILTER_SESSION_KEY = 'score_filter';

const ScoreFilterPopover = ({
  boards,
}: {
  boards?: { _id: string; name: string }[];
}) => {
  const [boardId] = useFilterQueryState<string>('scoreBoardId');
  const [pipelineId] = useFilterQueryState<string>('scorePipelineId');
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

                <SelectBoardFilterItem />
                <SelectPipelineFilterItem />
                <Command.Separator className="my-1" />
                <SelectStageFilterItem />
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
          <SelectBoardFilterView preloadedBoards={boards} />
          <SelectPipelineFilterView boardId={boardId || undefined} />
          <SelectStageFilterView pipelineId={pipelineId || undefined} />
          <SelectScoreActionFilterView />
          <SelectScoreActionTypeFilterView />
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
  const [boardId] = useFilterQueryState<string>('scoreBoardId');
  const [pipelineId] = useFilterQueryState<string>('scorePipelineId');
  const { boards } = useGetSalesBoards();

  return (
    <Filter id="score-filter" sessionKey={SCORE_FILTER_SESSION_KEY}>
      <Filter.Bar>
        <SelectScoreCampaignFilterBar />
        <SelectOwnerTypeFilterBar />
        <SelectScoreCustomerFilterBar />
        <SelectBoardFilterBar preloadedBoards={boards} />
        <SelectPipelineFilterBar boardId={boardId || undefined} />
        <SelectStageFilterBar pipelineId={pipelineId || undefined} />
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
        <ScoreFilterPopover boards={boards} />
        <ScoreTotalCount />
      </Filter.Bar>
    </Filter>
  );
};

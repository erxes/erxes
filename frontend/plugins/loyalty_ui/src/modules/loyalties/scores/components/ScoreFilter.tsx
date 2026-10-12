import { useTranslation } from 'react-i18next';
import { IconCalendar, IconFileDescription } from '@tabler/icons-react';

import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';
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
  const [queries] = useMultiQueryState<{
    scoreOwnerType: string;
    scoreOwnerId: string;
    scoreCampaignId: string;
    scoreDate: string;
    scoreOrderType: string;
    scoreAction: string;
    description: string;
  }>([
    'scoreOwnerType',
    'scoreOwnerId',
    'scoreCampaignId',
    'scoreDate',
    'scoreOrderType',
    'scoreAction',
    'description',
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
  const [description] = useFilterQueryState<string>('description');

  return (
    <Filter id="score-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <SelectScoreCampaign.FilterBar />
        <SelectOwnerType.FilterBar />
        <SelectOwner.FilterBar
          queryKey="scoreOwnerId"
          ownerTypeKey="scoreOwnerType"
        />
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

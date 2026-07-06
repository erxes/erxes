import { CyclesBreadcrumb } from '@/cycle/components/CyclesBreadcrumb';
import { CyclesRecordTable } from '@/cycle/components/CyclesRecordTable';
import { AddCycleSheet } from '@/cycle/components/add-cycle/AddCycle';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import {
  FavoriteToggleIconButton,
  PageHeader,
  createFavoriteBreadcrumb,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const CyclesPage = () => {
  const { teamId } = useParams();
  const { t } = useTranslation('operation');
  const link = `/operation/team/${teamId}/cycles`;
  const favoriteBreadcrumb = createFavoriteBreadcrumb(teamId, t('cycles'));

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <TeamBreadCrumb />
              <Separator.Inline />
              <CyclesBreadcrumb link={link} />
              <Breadcrumb.Item className="ml-1">
                <FavoriteToggleIconButton
                  breadcrumb={favoriteBreadcrumb}
                  icon="IconListCheck"
                />
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <AddCycleSheet />
      </PageHeader>
      <CyclesRecordTable />
    </>
  );
};

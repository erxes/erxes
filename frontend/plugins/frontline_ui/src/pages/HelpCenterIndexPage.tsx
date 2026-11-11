import { IconLifebuoy, IconPlus } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Kbd,
  PageContainer,
  PageSubHeader,
  Separator,
  useMultiQueryState,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  createFavoriteBreadcrumb,
  getSidePanelRecordPath,
  useSidePanel,
} from 'ui-modules';
import { HelpCenterFilter } from '@/helpcenter/components/HelpCenterFilter';
import { HelpCenterRecordTable } from '@/helpcenter/components/HelpCenterRecordTable';
import { HELP_CENTER_CONTENT_TYPE } from '@/helpcenter/constants';

export const HelpCenterIndexPage = () => {
  const { t } = useTranslation('frontline');
  const { openNewRecord } = useSidePanel();
  const [{ editId }, setQueries] = useMultiQueryState<{
    editId: string;
    panel: string;
  }>(['editId', 'panel']);
  const openCreate = () => openNewRecord(HELP_CENTER_CONTENT_TYPE);

  useEffect(() => {
    if (!editId) return;

    setQueries({
      editId: null,
      panel: getSidePanelRecordPath({
        contentType: HELP_CENTER_CONTENT_TYPE,
        contentId: editId,
      }),
    });
  }, [editId, setQueries]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/helpcenter">
                    <IconLifebuoy />
                    {t('help-center', 'Help Center')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={createFavoriteBreadcrumb(
              t('help-center', 'Help Center'),
            )}
            icon="IconLifebuoy"
          />
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={openCreate} className="h-7 py-1">
            <IconPlus />
            {t('helpcenter-create', 'Create Help Center')}
            <Kbd>C</Kbd>
          </Button>
        </PageHeader.End>
      </PageHeader>

      <PageSubHeader>
        <HelpCenterFilter />
      </PageSubHeader>

      <HelpCenterRecordTable onCreate={openCreate} />
    </PageContainer>
  );
};

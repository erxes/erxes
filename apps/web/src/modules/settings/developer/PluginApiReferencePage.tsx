import { IconSourceCode } from '@tabler/icons-react';
import { PageContainer, PageHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { ApiReferenceView } from './ApiReferenceView';
import { usePluginReferences } from './pluginReferences';

/**
 * Settings › Developer › `<plugin>` API: the endpoints an installed plugin documents, from
 * its own API, with a client that calls them as the member.
 */
export const PluginApiReferencePage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { plugin = '' } = useParams();
  const references = usePluginReferences();

  return (
    <QueryState query={references} className="py-12">
      {(list) => {
        const reference = list.find((entry) => entry.name === plugin);

        if (!reference) return <NotFoundPage />;

        return (
          <PageContainer>
            <PageHeader>
              <PageHeader.Start>
                <AppBreadcrumb
                  items={[
                    {
                      label: t('plugin-api', '{{title}} API', { title: reference.title }),
                      to: paths.settings.pluginApi(reference.name),
                      icon: IconSourceCode,
                    },
                  ]}
                />
              </PageHeader.Start>
            </PageHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ApiReferenceView key={reference.name} source={reference.source} />
            </div>
          </PageContainer>
        );
      }}
    </QueryState>
  );
};

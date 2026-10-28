import { usePropertiesScope } from '@/properties/context/PropertiesScopeContext';
import { Can, PageHeader } from 'ui-modules';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link, useLocation, useParams } from 'react-router-dom';
import { IconHierarchy2, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AddPropertyGroup } from './PropertyGroupAdd';
import { getPerTypePropertiesPath } from '../constants/perTypeContentTypes';

export function PropertiesHeader() {
  const { basePath: propertiesBasePath } = usePropertiesScope();
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { type } = useParams<{ type: string }>();
  const { pathname } = useLocation();
  const onFieldRoute =
    pathname.includes('add') || pathname.split(type || '')[1]?.length > 2;
  const perTypePath = getPerTypePropertiesPath(type || '');

  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={propertiesBasePath}>
                  <IconHierarchy2 />
                  {t('properties', 'Properties')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            {type && <Breadcrumb.Separator />}
            {type && (
              <Breadcrumb.Item>
                <Button variant="ghost" asChild className="capitalize">
                  <Link to={`${propertiesBasePath}?type=${type}`}>
                    {t(
                      `content-type.${type.replace(':', '-')}`,
                      type.replace(':', ' '),
                    )}{' '}
                    {t('properties-suffix', 'properties')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            )}
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
      <PageHeader.End>
        {!onFieldRoute && !perTypePath && (
          <AddPropertyGroup contentType={type || ''} />
        )}
        {type && !perTypePath && (
          <Can action="fieldsManage">
            <Button asChild>
              <Link to={`${propertiesBasePath}/${type}/add`}>
                <IconPlus />
                {t('add-field', 'Add field')}
              </Link>
            </Button>
          </Can>
        )}
      </PageHeader.End>
    </PageHeader>
  );
}

import { IconHierarchy2, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useMatch, useParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { PROPERTIES_BASE_PATH, PROPERTY_TYPES } from '../constants';
import { useCanManageFields } from '../usePropertyMutations';
import { AddPropertyGroup } from './PropertyGroupAdd';

export const PropertiesHeader = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { type } = useParams<{ type: string }>();
  const manager = useCanManageFields();
  const onList = !!useMatch(`${PROPERTIES_BASE_PATH}/:type`);
  const onTypeAdd = useMatch(`${PROPERTIES_BASE_PATH}/:type/add`);
  const onGroupAdd = useMatch(`${PROPERTIES_BASE_PATH}/:type/:groupId/add`);
  const onAdd = !!onTypeAdd || !!onGroupAdd;
  const propertyType = PROPERTY_TYPES.find((item) => item.contentType === type);

  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={PROPERTIES_BASE_PATH}>
                  <IconHierarchy2 />
                  {t('properties', 'Properties')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            {propertyType && <Breadcrumb.Separator />}
            {propertyType && (
              <Breadcrumb.Item>
                <Button variant="ghost" asChild className="capitalize">
                  <Link to={`${PROPERTIES_BASE_PATH}/${propertyType.contentType}`}>
                    {t(`content-type.${propertyType.i18nKey}`, propertyType.description)}{' '}
                    {t('properties-suffix', 'properties')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            )}
            {propertyType && !onList && (
              <>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Page className="px-3 text-sm font-medium">
                    {onAdd
                      ? t('add-property', 'Add Property')
                      : t('edit-property', 'Edit Property')}
                  </Breadcrumb.Page>
                </Breadcrumb.Item>
              </>
            )}
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
      <PageHeader.End>
        {propertyType && onList && manager && (
          <>
            <AddPropertyGroup contentType={propertyType.contentType} />
            <Button asChild>
              <Link to={`${PROPERTIES_BASE_PATH}/${propertyType.contentType}/add`}>
                <IconPlus />
                {t('add-field', 'Add field')}
              </Link>
            </Button>
          </>
        )}
      </PageHeader.End>
    </PageHeader>
  );
};

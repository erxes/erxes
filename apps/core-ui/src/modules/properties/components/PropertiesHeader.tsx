import type { FieldContentType } from '@erxes/core-contract';
import { IconHierarchy2, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button, PageHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useMatch } from 'react-router-dom';
import { PROPERTY_TYPES, propertiesPath } from '../constants';
import { useCanManageFields } from '../usePropertyMutations';
import { AddPropertyGroup } from './PropertyGroupAdd';

export const PropertiesHeader = ({ contentType }: { contentType: FieldContentType }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const manager = useCanManageFields();
  const list = propertiesPath(contentType);
  const onList = !!useMatch(list);
  const onTypeAdd = useMatch(`${list}/add`);
  const onGroupAdd = useMatch(`${list}/:groupId/add`);
  const onAdd = !!onTypeAdd || !!onGroupAdd;
  const propertyType = PROPERTY_TYPES[contentType];

  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={propertyType.basePath}>
                  <IconHierarchy2 />
                  {t('properties', 'Properties')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Button variant="ghost" asChild className="capitalize">
                <Link to={list}>
                  {t(`content-type.${propertyType.i18nKey}`, propertyType.label)}{' '}
                  {t('properties-suffix', 'properties')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            {!onList && (
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
        {onList && manager && (
          <>
            <AddPropertyGroup contentType={contentType} />
            <Button asChild>
              <Link to={`${list}/add`}>
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

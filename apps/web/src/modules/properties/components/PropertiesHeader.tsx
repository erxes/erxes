import type { FieldContentType } from '@erxes/core-contract';
import { IconHierarchy2, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, PageHeader, buttonVariants, cn } from 'erxes-ui';
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
    <PageHeader variant="wrap">
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Link to={propertyType.basePath} className={buttonVariants({ variant: 'ghost' })}>
                <IconHierarchy2 />
                {t('properties', 'Properties')}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Link to={list} className={cn(buttonVariants({ variant: 'ghost' }), 'capitalize')}>
                {t(`content-type.${propertyType.i18nKey}`, propertyType.label)}{' '}
                {t('properties-suffix', 'properties')}
              </Link>
            </Breadcrumb.Item>
            {!onList && (
              <>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Page variant="text">
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
            <Link to={`${list}/add`} className={buttonVariants()}>
              <IconPlus />
              {t('add-field', 'Add field')}
            </Link>
          </>
        )}
      </PageHeader.End>
    </PageHeader>
  );
};

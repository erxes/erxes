import type { PropertyContentType } from '@erxes/core-contract';
import { IconHierarchy2, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, PageHeader, buttonVariants, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useMatch } from 'react-router-dom';
import { propertyPaths } from '~/lib/paths';
import { useCanManageFields } from '../usePropertyMutations';
import { usePropertyTypeLabel } from '../usePropertyTypeLabel';
import { AddPropertyGroup } from './PropertyGroupAdd';

export const PropertiesHeader = ({ contentType }: { contentType: PropertyContentType }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const manager = useCanManageFields();
  const { area, list, add } = propertyPaths(contentType);
  const onList = !!useMatch(list);
  const onTypeAdd = useMatch(add());
  const onGroupAdd = useMatch(`${list}/:groupId/add`);
  const onAdd = !!onTypeAdd || !!onGroupAdd;
  const typeLabel = usePropertyTypeLabel();

  return (
    <PageHeader variant="wrap">
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Link to={area} className={buttonVariants({ variant: 'ghost' })}>
                <IconHierarchy2 />
                {t('properties', 'Properties')}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Link to={list} className={cn(buttonVariants({ variant: 'ghost' }), 'capitalize')}>
                {typeLabel(contentType)} {t('properties-suffix', 'properties')}
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
            <Link to={add()} className={buttonVariants()}>
              <IconPlus />
              {t('add-field', 'Add field')}
            </Link>
          </>
        )}
      </PageHeader.End>
    </PageHeader>
  );
};

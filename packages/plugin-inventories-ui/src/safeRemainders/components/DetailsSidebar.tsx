import React from 'react';
import Select from 'react-select-plus';
import { __, Wrapper, Box, ControlLabel, FormGroup } from '@erxes/ui/src';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import { router } from '@erxes/ui/src/utils/core';
import { ISafeRemainder } from '../types';
import { SidebarContent } from '../../styles';

type Props = {
  safeRemainder: ISafeRemainder;
  history: any;
  queryParams: any;
};

const DetailSidebar = (props: Props) => {
  let timer: NodeJS.Timer;
  const { history, queryParams, safeRemainder } = props;

  const setFilter = (name, value) => {
    router.removeParams(history, 'page');
    router.setParams(history, { [name]: value });
  };

  return (
    <Wrapper.Sidebar>
      <Box title={__('Main Info')} name="showMainInfo">
        <SidebarContent>
          <FormGroup>
            <ControlLabel>{__('Branch')}: </ControlLabel>
            <br />
            <span>{safeRemainder.branch && safeRemainder.branch.title}</span>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Department')}: </ControlLabel>
            <br />
            <span>
              {safeRemainder.department && safeRemainder.department.title}
            </span>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Product Category')}: </ControlLabel>
            <br />
            <span>
              {safeRemainder.productCategory &&
                `${safeRemainder.productCategory.code} - ${safeRemainder.productCategory.name}`}
            </span>
          </FormGroup>
        </SidebarContent>
      </Box>

      <Box title={__('Filters')} name="showFilters">
        <SidebarContent>
          <FormGroup>
            <ControlLabel>{__('Product')}</ControlLabel>
            <SelectProductCategory
              label="Choose product category"
              name="selectedProductCategoryId"
              initialValue={queryParams.productCategoryId}
              onSelect={catId => setFilter('productCategoryId', catId)}
              multi={false}
              customOption={{ value: '', label: 'All products' }}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Diff Type')}</ControlLabel>
            <Select
              options={[
                { label: 'Тэнцүү', value: 'eq' },
                { label: 'Их', value: 'gt' },
                { label: 'Бага', value: 'lt' }
              ]}
              value={(queryParams.diffType || '').split(',')}
              onChange={(options: any) =>
                setFilter(
                  'diffType',
                  (options || []).map(o => o.value).join(',')
                )
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Status')}</ControlLabel>
            <Select
              options={[
                { label: 'All', value: '' },
                { label: 'New', value: 'new' },
                { label: 'Checked', value: 'checked' }
              ]}
              value={queryParams.status || ''}
              onChange={(option: any) => setFilter('status', option.value)}
            />
          </FormGroup>
        </SidebarContent>
      </Box>
    </Wrapper.Sidebar>
  );
};

export default DetailSidebar;

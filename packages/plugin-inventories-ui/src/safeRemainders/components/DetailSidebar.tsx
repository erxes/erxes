import Box from '@erxes/ui/src/components/Box';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import Select from 'react-select-plus';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import { __ } from '@erxes/ui/src/utils';
import { ISafeRemainder } from '../types';
import { PaddingTop } from '../../styles';
import { router } from '@erxes/ui/src/utils/core';
import { Wrapper } from '@erxes/ui/src/layout';

function DetailSidebar({
  history,
  queryParams,
  safeRemainder
}: {
  safeRemainder: ISafeRemainder;
  history: any;
  queryParams: any;
}) {
  let timer: NodeJS.Timer;

  const setFilter = (name, value) => {
    router.removeParams(history, 'page');
    router.setParams(history, { [name]: value });
  };

  return (
    <Wrapper.Sidebar>
      <Box title={__('Main Info')} name="showDeviceProperties">
        <FormGroup>
          <ControlLabel>{__('Branch')}: </ControlLabel>
          <span>{safeRemainder.branch && safeRemainder.branch.title}</span>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Department')}: </ControlLabel>
          <span>
            {safeRemainder.department && safeRemainder.department.title}
          </span>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Product Category')}: </ControlLabel>
          <span>
            {safeRemainder.productCategory &&
              `${safeRemainder.productCategory.code} - ${safeRemainder.productCategory.name}`}
          </span>
        </FormGroup>
      </Box>

      <Box title={__('Filters')} name="showDeviceProperties">
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
            onChange={options =>
              setFilter('diffType', (options || []).map(o => o.value).join(','))
            }
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Status')}</ControlLabel>
          <Select
            options={[
              { label: 'All', value: '' },
              { label: 'new', value: 'new' },
              { label: 'checked', value: 'checked' }
            ]}
            value={queryParams.status || ''}
            onChange={option => setFilter('status', option.value)}
          />
        </FormGroup>
      </Box>
    </Wrapper.Sidebar>
  );
}

export default DetailSidebar;

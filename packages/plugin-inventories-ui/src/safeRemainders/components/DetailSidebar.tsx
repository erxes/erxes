import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import { __ } from '@erxes/ui/src/utils';
import { ISafeRemainder } from '../types';
import { PaddingTop } from '../../styles';
import { router } from '@erxes/ui/src/utils/core';
import { Wrapper } from '@erxes/ui/src/layout';
import Box from '@erxes/ui/src/components/Box';

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
      <PaddingTop>
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
              initialValue={queryParams.productId}
              onSelect={productId => setFilter('productCategoryId', productId)}
              multi={false}
              customOption={{ value: '', label: 'All products' }}
            />
          </FormGroup>
        </Box>
      </PaddingTop>
    </Wrapper.Sidebar>
  );
}

export default DetailSidebar;

import dayjs from 'dayjs';
import Box from '@erxes/ui/src/components/Box';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import queryString from 'query-string';
import React from 'react';
import Select from 'react-select-plus';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __, router } from '@erxes/ui/src/utils/core';
import { SidebarContent } from '../../styles';
import { useHistory, useLocation } from 'react-router-dom';

type Props = {
  safeRemainder: any;
};

export default function Sidebar(props: Props) {
  const { safeRemainder } = props;
  const history = useHistory();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const setFilter = (name: string, value: string) => {
    router.removeParams(history, 'page');
    router.setParams(history, { [name]: value });
  };

  return (
    <Wrapper.Sidebar>
      <Box title={__('Main Info')} name="showMainInfo">
        <SidebarContent>
          <FormGroup>
            <ControlLabel>{__('Date')}: </ControlLabel>
            <br />
            <span>{dayjs(safeRemainder.date).format('lll') || ''}</span>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Description')}: </ControlLabel>
            <br />
            <span>{safeRemainder.description || ''}</span>
          </FormGroup>
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
              onSelect={(catId: any) => setFilter('productCategoryId', catId)}
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
}

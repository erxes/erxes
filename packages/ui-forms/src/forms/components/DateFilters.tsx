import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { DateInputContainer } from '../styles';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  fields: any[];
  loading: boolean;
  emptyText?: string;
}

function DateFilters({ history, counts, fields, loading, emptyText }: IProps) {
  const onChangeRangeFilter = (field: string, kind: string, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';

    const { queryParams } = this.props;

    // if (queryParams[`${field}_${kind}`] !== formattedDate) {
    //   onSelect(formattedDate, kind);
    // }
  };

  const data = (
    <>
      <SidebarList>
        {fields.map(field => {
          const onClick = () => {
            router.setParams(history, { field: field._id });
            router.removeParams(history, 'page');
          };

          return (
            <li key={field._id}>
              <a
                href="#filter"
                tabIndex={0}
                className={
                  router.getParam(history, 'brand') === field._id
                    ? 'active'
                    : ''
                }
                onClick={onClick}
              >
                <div style={{ display: 'block' }}>
                  <FieldStyle>{field.label}</FieldStyle>
                  <SidebarCounter>{counts[field._id]}</SidebarCounter>

                  <DateInputContainer>
                    <DateControl
                      // value={queryParams.startDate}
                      required={false}
                      name="startDate"
                      onChange={date =>
                        onChangeRangeFilter(field.name, 'startDate', date)
                      }
                      placeholder={'Start date'}
                      dateFormat={'YYYY-MM-DD'}
                    />

                    <DateControl
                      // value={queryParams.endDate}
                      required={false}
                      name="endDate"
                      placeholder={'End date'}
                      onChange={date =>
                        onChangeRangeFilter(field.name, 'endDate', date)
                      }
                      dateFormat={'YYYY-MM-DD'}
                    />
                  </DateInputContainer>
                </div>
              </a>
            </li>
          );
        })}
      </SidebarList>

      <Button
        block={true}
        btnStyle="success"
        uppercase={false}
        onClick={() => {
          console.log('click');
        }}
        icon="filter"
      >
        {__('Filter')}
      </Button>
    </>
  );

  return (
    <Box
      title={__('Filter by date')}
      collapsible={fields.length > 5}
      name="showFilterByBrand"
    >
      <DataWithLoader
        data={data}
        loading={loading}
        count={fields.length}
        emptyText={emptyText || 'Empty'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(DateFilters);

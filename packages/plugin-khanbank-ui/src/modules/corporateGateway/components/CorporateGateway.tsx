import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IRouterProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import * as routerUtils from '@erxes/ui/src/utils/router';
import React from 'react';
import { withRouter } from 'react-router-dom';

import List from '../../configs/containers/List';
import Detail from './Detail';

// import Detail from '../containers/Detail';
type Props = {
  queryParams: any;
  loading?: boolean;
} & IRouterProps;

const CorporateGateway = (props: Props) => {
  const { loading = false, queryParams, history } = props;

  const breadcrumb = [
    {
      title: __('Khanbank Corporate Gateway'),
      link: '/khanbank-corporate-gateway'
    }
  ];
  const count = queryParams._id ? 1 : 0;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title="Khanbank Corporate Gateway"
          breadcrumb={breadcrumb}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/27.svg"
          title="Khanbank Corporate Gateway"
          description={__(
            `Corporate Gateway enables you access banking services through erxes.`
          )}
        />
      }
      leftSidebar={<List {...props} />}
      content={
        <DataWithLoader
          data={<Detail {...props} />}
          count={count}
          loading={loading}
          emptyContent={
            <EmptyContent
              content={{
                title: __('Getting Started with Khanbank Corporate Gateway'),
                steps: [
                  {
                    title: __('Create Corporate Gateway config'),
                    description: __(
                      'Register at Khanbank and become a Khanbank customer'
                    ),
                    url: `https://www.khanbank.com/en/corporate/product/429?activetab=2`,
                    urlText: 'Apply for Corporate Gateway',
                    isOutside: true,
                    target: '_blank'
                  }
                ]
              }}
              maxItemWidth="360px"
            />
          }
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
};

export default withRouter<Props>(CorporateGateway);

import * as routerUtils from '@erxes/ui/src/utils/router';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Detail from './Detail';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import List from '../../configs/containers/List';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';

// import Detail from '../containers/Detail';
type Props = {
  queryParams: any;
  loading?: boolean;
};

const CorporateGateway = (props: Props) => {
  const { loading = false, queryParams } = props;

  const breadcrumb = [
    {
      title: __('Khanbank Corporate Gateway'),
      link: '/khanbank-corporate-gateway',
    },
  ];
  const count = queryParams._id ? 1 : 0;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Khanbank Corporate Gateway")}
          breadcrumb={breadcrumb}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/27.svg"
          title={__("Khanbank Corporate Gateway")}
          description={__(
            `Corporate Gateway enables you access banking services through erxes.`,
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
                      'Register at Khanbank and become a Khanbank customer',
                    ),
                    url: `https://www.khanbank.com/en/corporate/product/429?activetab=2`,
                    urlText: 'Apply for Corporate Gateway',
                    isOutside: true,
                    target: '_blank',
                  },
                ],
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

export default CorporateGateway;

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Detail from './Detail';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import List from '../accounts/containers/list';
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
      title: __('Golomtbank Corporate Gateway'),
      link: '/Golomtbank-corporate-gateway',
    },
  ];
  const count = queryParams.account ? 1 : 0;

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title="Golomt Corporate Gateway"
          breadcrumb={breadcrumb}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/27.svg"
          title="Golomtbank Corporate Gateway"
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
                title: __('Getting Started with Golomtbank Corporate Gateway'),
                steps: [
                  {
                    title: __('Create Corporate Gateway config'),
                    description: __(
                      'Register at Golomtbank and become a Golomtbank customer',
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

import React, { useState } from 'react';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { gql, useQuery } from '@apollo/client';
import { __ } from '@erxes/ui/src/utils/index';

import Form from '../../components/chart/Form';
import { mutations, queries } from '../../graphql';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { filterChartTemplates } from '../../utils';
import { ReportTemplatesListQueryResponse } from '../../types';
import {
  IChart,
  ReportChartFormMutationResponse,
  ReportChartTemplatesListQueryResponse,
  reportServicesListQueryResponse,
} from '../../types';

type Props = {
  history: any;
  queryParams: any;
  chart?: any;
  item: any;
  type?: 'dashboard' | 'report';
  closeDrawer(): void;
};

const FormContainer = (props: Props) => {
  const { queryParams, chart, type, item, closeDrawer } = props;

  // const [serviceName, setServiceName] = useState(
  //   chart
  //     ? chart.serviceName
  //     : type === 'report'
  //       ? item?.serviceName
  //       : undefined,
  // );

  const [serviceName, setServiceName] = useState(
    chart?.serviceName || undefined,
  );

  // const templateListQuery = useQuery<ReportTemplatesListQueryResponse>(
  //   gql(queries.reportTemplatesList),
  //   {
  //     skip: type !== 'report',
  //     variables: {
  //       serviceName: item?.serviceName
  //     },
  //     fetchPolicy: 'network-only'
  //   }
  // );

  const servicesListQuery = useQuery<reportServicesListQueryResponse>(
    gql(queries.reportServicesList),
    {
      fetchPolicy: 'network-only',
    },
  );

  const chartTemplatesListQuery =
    useQuery<ReportChartTemplatesListQueryResponse>(
      gql(queries.reportChartTemplatesList),
      {
        skip: !serviceName,
        variables: { serviceName },
        fetchPolicy: 'network-only',
      },
    );

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      closeDrawer();
    };

    return (
      <ButtonMutate
        mutation={
          object
            ? mutations[type + 'ChartsEdit']
            : mutations[type + 'ChartsAdd']
        }
        variables={values}
        callback={afterSave}
        refetchQueries={[type + 'Detail']}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const serviceNames = servicesListQuery?.data?.reportServicesList || [];
  // const reportTemplates = templateListQuery?.data?.reportTemplatesList || [];
  const chartTemplates =
    chartTemplatesListQuery?.data?.reportChartTemplatesList || [];

  // const services = type === 'report' ? [item?.serviceName] : serviceNames;
  // const templates =
  //   type === 'report'
  //     ? filterChartTemplates(chartTemplates, reportTemplates, item)
  //     : chartTemplates;

  const finalProps = {
    ...props,
    // serviceNames: services,
    // chartTemplates: templates,
    serviceNames,
    chartTemplates,
    renderButton,
    updateServiceName: setServiceName,
  };

  return <Form {...finalProps} />;
};

export default FormContainer;

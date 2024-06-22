import React, { useEffect, useState } from 'react';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { gql, useQuery } from '@apollo/client';
import { __ } from '@erxes/ui/src/utils/index';

import Form from '../../components/chart/Form';
import { mutations, queries } from '../../graphql';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { filterChartTemplates } from '../../utils';
import { InsightTemplatesListQueryResponse } from '../../types';
import {
  IChart,
  ChartFormMutationResponse,
  InsightChartTemplatesListQueryResponse,
  InsightServicesListQueryResponse,
} from '../../types';

type Props = {
  queryParams: any;
  chart?: any;
  item: any;
  type?: 'dashboard' | 'report';
  closeDrawer(): void;
};

const FormContainer = (props: Props) => {
  const { queryParams, chart, type, item, closeDrawer } = props;

  const [serviceName, setServiceName] = useState(
    chart?.serviceName || undefined,
  );

  const templateListQuery = useQuery<InsightTemplatesListQueryResponse>(
    gql(queries.insightTemplatesList),
    {
      skip: type !== 'report',
      fetchPolicy: 'network-only',
    },
  );

  const servicesListQuery = useQuery<InsightServicesListQueryResponse>(
    gql(queries.insightServicesList),
    {
      fetchPolicy: 'network-only',
    },
  );

  const chartTemplatesListQuery =
    useQuery<InsightChartTemplatesListQueryResponse>(
      gql(queries.insightChartTemplatesList),
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
            ? mutations.chartsEdit
            : mutations.chartsAdd
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

  const serviceNames = servicesListQuery?.data?.insightServicesList || [];
  const reportTemplates = templateListQuery?.data?.insightTemplatesList || [];
  const chartTemplates =
    chartTemplatesListQuery?.data?.insightChartTemplatesList || [];

  const services = type === 'report' ? [item?.serviceName] : serviceNames;
  const templates =
    type === 'report'
      ? filterChartTemplates(chartTemplates, reportTemplates, item)
      : chartTemplates;

  const finalProps = {
    ...props,
    serviceNames: services,
    chartTemplates: templates,
    renderButton,
    updateServiceName: setServiceName,
  };

  return <Form {...finalProps} />;
};

export default FormContainer;

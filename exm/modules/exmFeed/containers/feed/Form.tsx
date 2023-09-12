import { mutations, queries } from '../../graphql';

import BravoForm from '../../components/feed/BravoForm';
import ButtonMutate from '../../../common/ButtonMutate';
import EventForm from '../../components/feed/EventForm';
import Form from '../../components/feed/Form';
import { FormWrap } from '../../styles';
import { IButtonMutateProps } from '../../../common/types';
import PublicHolidayForm from '../../components/feed/PublicHolidayForm';
import React from 'react';
import Spinner from '../../../common/Spinner';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';

type Props = {
  contentType: string;
  item?: any;
  transparent?: boolean;
  closeModal?: () => void;
  isEdit?: boolean;
};

export default function FormContainer(props: Props) {
  const { contentType, item, transparent } = props;

  const { data } = useQuery(gql(queries.fields), {
    variables: {
      contentType: `exmFeed${contentType
        .substring(0, 1)
        .toUpperCase()}${contentType.substring(1)}`
    }
  });

  const { data: dataDepartment, loading: loadingDepartment } = useQuery(
    gql(queries.departments)
  );

  const { data: dataBranch, loading: loadingBranch } = useQuery(
    gql(queries.branches)
  );

  const { data: dataUnit, loading: loadingUnit } = useQuery(
    gql(queries.unitsMain)
  );

  if (loadingDepartment || loadingBranch || loadingUnit) {
    return <Spinner />;
  }

  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      if (callback) {
        callback();
      }
    };

    const variables = {
      ...values
    };

    if (item) {
      variables._id = item._id;
    }

    return (
      <ButtonMutate
        mutation={variables._id ? mutations.editFeed : mutations.addFeed}
        variables={variables}
        callback={callBackResponse}
        refetchQueries={['feed']}
        isSubmitted={isSubmitted}
        block={true}
        btnStyle="default"
        successMessage={`You successfully ${
          variables._id ? 'edited' : 'added'
        }`}
        type="submit"
      >
        Post
      </ButtonMutate>
    );
  };

  const fields = (data && data.fields) || [];

  const updateProps = {
    ...props,
    fields,
    departments: (dataDepartment && dataDepartment.departments) || [],
    units: (dataUnit && dataUnit.unitsMain.list) || [],
    branches: dataBranch && dataBranch.branches,
    closeModal: props.closeModal,

    renderButton
  };

  const renderContent = () => {
    if (props.contentType === 'post') {
      return <Form {...updateProps} />;
    }

    if (props.contentType === 'event') {
      return <EventForm {...updateProps} />;
    }

    if (props.contentType === 'publicHoliday') {
      return <PublicHolidayForm {...updateProps} />;
    }

    return <BravoForm {...updateProps} />;
  };

  return <FormWrap transparent={transparent}>{renderContent()}</FormWrap>;
}

import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { mutations, queries } from '../graphql';
import Form from '../components/Form';
import BravoForm from '../components/BravoForm';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import { ButtonMutate } from 'erxes-ui';
import EventForm from '../components/EventForm';
import PublicHolidayForm from '../components/PublicHolidayForm';

type Props = {
  contentType?: string;
  item?: any;
  closeModal?: () => void;
};

export default function FormContainer(props: Props) {
  const { contentType, item } = props;

  const { data } = useQuery(gql(queries.fields), {
    variables: {
      contentType: `exmFeed${contentType
        .substring(0, 1)
        .toUpperCase()}${contentType.substring(1)}`
    }
  });

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
        refetchQueries={[{ query: gql(queries.feed) }]}
        isSubmitted={isSubmitted}
        successMessage={`You successfully ${
          variables._id ? 'edited' : 'added'
        }`}
        type='submit'
        icon='check-circle'
      />
    );
  };

  const fields = (data && data.fields) || [];

  const updateProps = {
    ...props,
    fields,
    renderButton
  };

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
}

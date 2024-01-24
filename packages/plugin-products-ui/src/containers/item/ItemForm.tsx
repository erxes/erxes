import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import Form from '../../components/item/ItemForm';
import { mutations, queries } from '../../graphql';
import { IItem, ItemsQueryResponse } from '../.././types';
import { withRouter } from 'react-router-dom';

type Props = {
  item?: IItem;
  closeModal: () => void;
};

type FinalProps = {
  itemsQuery: ItemsQueryResponse;
} & Props &
  IRouterProps;

const ItemFormContainer = (props: FinalProps) => {
  const { itemsQuery } = props;

  if (itemsQuery.loading) {
    return null;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    const { itemsTotalCount } = values;

    const attachment = values.attachment || undefined;

    values.itemsTotalCount = Number(itemsTotalCount);

    values.attachment = attachment
      ? { ...attachment, __typename: undefined }
      : null;

    return (
      <ButtonMutate
        mutation={object ? mutations.itemEdit : mutations.itemsAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const items = itemsQuery.items || [];

  const updatedProps = {
    ...props,
    renderButton,
    items,
  };

  return <Form {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['itemsDetail', 'items', 'itemsTotalCount'];
};

export default withProps<Props>(
  compose(
    graphql<Props, ItemsQueryResponse>(gql(queries.items), {
      name: 'itemsQuery',
    }),
  )(withRouter<FinalProps>(ItemFormContainer)),
);

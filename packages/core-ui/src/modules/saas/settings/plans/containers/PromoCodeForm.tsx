import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Alert from 'modules/common/utils/Alert';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import PromoCodeForm from '../components/PromoCodeForm';
import { mutations } from '../graphql';

type Props = {
  usePromoCodeMutation: any;
};

const PromoCodeFormContainer = (props: Props) => {
  const { usePromoCodeMutation } = props;

  const usePromoCode = (code: string) => {
    usePromoCodeMutation({
      variables: { code },
    })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  return <PromoCodeForm usePromoCode={usePromoCode} />;
};

export default compose(
  graphql(gql(mutations.usePromoCode), {
    name: 'usePromoCodeMutation',
  }),
)(PromoCodeFormContainer);

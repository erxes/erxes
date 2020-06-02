import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { mutations as brandMutations } from 'modules/settings/brands/graphql';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  BrandDetailQueryResponse,
  BrandsConfigEmailMutationResponse
} from '../../brands/types';
import Config from '../components/Config';

type Props = {
  refetch: () => void;
  closeModal: () => void;
  brandId: string;
};

type FinalProps = {
  brandDetailQuery: BrandDetailQueryResponse;
  emailConfigQuery: any;
} & Props &
  BrandsConfigEmailMutationResponse;

const ConfigContainer = (props: FinalProps) => {
  const { brandDetailQuery, emailConfigQuery } = props;

  if (brandDetailQuery.loading || emailConfigQuery.loading) {
    return null;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={brandMutations.brandsConfigEmail}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully updated an ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    brand: brandDetailQuery.brandDetail,
    defaultTemplate: emailConfigQuery.brandsGetDefaultEmailConfig || '',
    renderButton
  };

  return <Config {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [{ query: gql(brandQueries.brands) }];
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandDetailQueryResponse, { brandId: string }>(
      gql`
        query brandDetail($brandId: String!) {
          brandDetail(_id: $brandId) {
            _id
            name
            emailConfig
          }
        }
      `,
      {
        name: 'brandDetailQuery',
        options: ({ brandId }: { brandId: string }) => {
          return {
            variables: {
              brandId
            }
          };
        }
      }
    ),

    graphql(
      gql`
        query brandsGetDefaultEmailConfig {
          brandsGetDefaultEmailConfig
        }
      `,
      {
        name: 'emailConfigQuery'
      }
    ),

    graphql(gql(brandMutations.brandsConfigEmail), {
      name: 'configEmailMutation'
    })
  )(ConfigContainer)
);

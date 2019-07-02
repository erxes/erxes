import gql from 'graphql-tag';
import { ButtonMutate } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { IButtonMutateProps } from 'modules/common/types';
import { __, withProps } from 'modules/common/utils';
import { mutations as brandMutations } from 'modules/settings/brands/graphql';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  BrandDetailQueryResponse,
  BrandsConfigEmailMutationResponse
} from '../../brands/types';
import { Config } from '../components';

const defaultTemplate = `<p>Dear {{fullName}},</p>
<p>You received following messages at <strong>{{brandName}}</strong>:</p>
<ul class="messages">
  {{#each messages}}
    <li><span>{{content}}</span></li>
  {{/each}}
</ul>
<p><a href="{domain}">See all messages on <strong>{{domain}}</strong></a></p>
<footer>Powered by <a href="https://crm.nmma.co/" target="_blank">Erxes</a>.</footer>

<style type="text/css">
    .erxes-mail {
        font-family: Arial;
        font-size: 13px;
    }
    .messages {
        background: #eee;
        list-style: none;
        padding: 20px;
        margin-bottom: 20px;
    }
    .messages li {
        margin-bottom: 10px;
    }
    .messages li:last-child {
        margin-bottom: 0;
    }
    .messages li span {
        display: inline-block;
        background-color: #482b82;
        padding: 12px 16px;
        border-radius: 5px;
        color: #fff;
    }
    footer {
        border-top: 1px solid ${colors.borderDarker};
        margin-top: 40px;
        padding-top: 10px;
        font-weight: bold;
    }
</style>`;

type Props = {
  refetch: () => void;
  closeModal: () => void;
  brandId: string;
};

type FinalProps = {
  brandDetailQuery: BrandDetailQueryResponse;
} & Props &
  BrandsConfigEmailMutationResponse;

const ConfigContainer = (props: FinalProps) => {
  const { brandDetailQuery, configEmailMutation, refetch } = props;

  if (brandDetailQuery.loading) {
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
    defaultTemplate,
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

    graphql(gql(brandMutations.brandsConfigEmail), {
      name: 'configEmailMutation'
    })
  )(ConfigContainer)
);

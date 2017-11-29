import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
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
        border-top: 1px solid #ddd;
        margin-top: 40px;
        padding-top: 10px;
        font-weight: bold;
    }
</style>`;

const ConfigContainer = props => {
  const { brandQuery, configEmailMutation, refetch } = props;

  if (brandQuery.loading) {
    return null;
  }

  const configEmail = (doc, callback) => {
    configEmailMutation({
      variables: doc
    })
      .then(() => {
        Alert.success('Congrats');
        refetch();
        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    brand: brandQuery.brandDetail,
    configEmail,
    defaultTemplate
  };

  return <Config {...updatedProps} />;
};

ConfigContainer.propTypes = {
  brandQuery: PropTypes.object,
  refetch: PropTypes.func,
  configEmailMutation: PropTypes.func
};

export default compose(
  graphql(
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
      name: 'brandQuery',
      options: ({ brandId }) => {
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
      mutation brandsConfigEmail($_id: String!, $emailConfig: JSON) {
        brandsConfigEmail(_id: $_id, emailConfig: $emailConfig) {
          _id
        }
      }
    `,
    {
      name: 'configEmailMutation'
    }
  )
)(ConfigContainer);

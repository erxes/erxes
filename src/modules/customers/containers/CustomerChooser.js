import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Chooser } from 'modules/common/components';
import { Alert, renderFullName } from 'modules/common/utils';
import { CustomerForm } from '../containers';
import { queries, mutations } from '../graphql';

class CustomerChooser extends React.Component {
  constructor(props) {
    super(props);
    this.state = { perPage: 20 };
  }

  render() {
    const { data, customersQuery, customersAdd } = this.props;

    const search = (value, loadmore) => {
      if (!loadmore) {
        this.setState({ perPage: 0 });
      }

      this.setState({ perPage: this.state.perPage + 20 }, () =>
        customersQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage
        })
      );
    };

    const clearState = () => {
      customersQuery.refetch({ searchValue: '' });
    };

    // add customer
    const addCustomer = ({ doc, callback }) => {
      customersAdd({
        variables: doc
      })
        .then(() => {
          customersQuery.refetch();

          Alert.success('Success');

          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const form = <CustomerForm action={addCustomer} />;

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        name: data.name,
        datas: data.customers
      },
      search,
      title: 'Customer',
      form,
      renderName: renderFullName,
      perPage: this.state.perPage,
      add: addCustomer,
      clearState,
      datas: customersQuery.customers || []
    };

    return <Chooser {...updatedProps} />;
  }
}

CustomerChooser.propTypes = {
  data: PropTypes.object.isRequired,
  customersQuery: PropTypes.object.isRequired,
  customersAdd: PropTypes.func.isRequired
};

export default compose(
  graphql(gql(queries.customers), {
    name: 'customersQuery',
    options: () => {
      return {
        variables: {
          perPage: 20
        }
      };
    }
  }),
  // mutations
  graphql(gql(mutations.customersAdd), {
    name: 'customersAdd'
  })
)(CustomerChooser);

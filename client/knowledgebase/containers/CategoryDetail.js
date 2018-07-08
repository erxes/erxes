import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { CategoryDetail as DumbCategoryDetail } from '../components';
import { AppConsumer } from './AppContext';
import queries from './graphql';

const CategoryDetail = (props) => {
  const extendedProps = {
    ...props,
    category: props.data.knowledgeBaseCategoriesDetail,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbCategoryDetail {...extendedProps} />;
};

CategoryDetail.propTypes = {
  data: PropTypes.object,
};

const WithData = graphql(
  gql(queries.getKbCategoryQuery),
  {
    options: (ownProps) => ({
      fetchPolicy: 'network-only',
      variables: {
        categoryId: ownProps.category._id,
      },
    })
  },
)(CategoryDetail);

const WithContext = (props) => {
  return (
    <AppConsumer>
      {({ goToCategories, activeCategory }) =>
        <WithData
          {...props}
          goToCategories={goToCategories}
          category={activeCategory}
        />
      }
    </AppConsumer>
  );
}

export default WithContext;

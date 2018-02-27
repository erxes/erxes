// import React from 'react';
// import PropTypes from 'prop-types';
// import { compose, graphql } from 'react-apollo';
// import gql from 'graphql-tag';
// import { Alert } from 'modules/common/utils';
// import { Spinner } from 'modules/common/components';
// import { List } from '../components';
//
// const ListContainer = props => {
//   const { saveMutation } = props;
//
//   const save = doc => {
//     saveMutation({
//       variables: { _id: integration._id, messengerData: doc }
//     })
//       .then(() => {
//         Alert.success('Successfully saved.');
//       })
//       .catch(error => {
//         Alert.error(error.message);
//       });
//   };
//
//   const updatedProps = {
//     ...props,
//     prevOptions: integration.messengerData || {},
//     save,
//     // TODO
//     user: {}
//   };
//
//   return <List {...updatedProps} />;
// };
//
// ListContainer.propTypes = {
//   saveMutation: PropTypes.func
// };
//
// export default compose(
//   graphql(
//     {
//       name: '',
//     }
//   )
// )(ListContainer);

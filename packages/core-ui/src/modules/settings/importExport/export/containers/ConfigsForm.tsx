// import Spinner from '@erxes/ui/src/components/Spinner';
// import gql from 'graphql-tag';
// import * as compose from 'lodash.flowright';
// import { withProps } from 'modules/common/utils';
// import React from 'react';
// import { graphql } from 'react-apollo';
// import { IImportHistoryContentType } from '../../types';
// import ConfigsForm from '../components/ConfigsForm';

// import { mutations, queries } from '../graphql';

// type Props = {
//   onChangeContentType: (value: IImportHistoryContentType) => void;
//   contentTypes: IImportHistoryContentType[];
//   type: string;
// };

// type State = {};

// type FinalProps = {
//   importHistoryGetTypes: any;
// } & Props;

// class FormContainer extends React.Component<FinalProps, State> {
//   render() {
//     const { importHistoryGetTypes } = this.props;

//     if (importHistoryGetTypes.loading) {
//       return <Spinner />;
//     }

//     const typeOptions = importHistoryGetTypes.importHistoryGetTypes || [];

//     return (
//       <ConfigsForm
//         contentType={this.props.contentTypes}
//         typeOptions={typeOptions}
//         columns={columns}
//         onClickField={this.onClickField}
//       />
//     );
//   }
// }

// export default withProps<Props>(
//   compose(
//     graphql<Props>(gql(queries.fieldsCombinedByContentType), {
//       name: 'importHistoriesCreate'
//     }),
//     graphql<Props>(gql(queries.fieldsCombinedByContentType), {
//       name: 'importHistoryGetTypes'
//     })
//   )(FormContainer)
// );

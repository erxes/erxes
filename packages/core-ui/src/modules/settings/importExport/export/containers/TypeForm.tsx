import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import TypeForm from '../components/TypeForm';
import { queries } from '../graphql';

type Props = {
  onChangeContentType: (contentType: string) => void;
  contentType: string;
};

type State = {};

type FinalProps = {
  exportHistoryGetTypes: any;
} & Props;

class FormContainer extends React.Component<FinalProps, State> {
  render() {
    const { exportHistoryGetTypes } = this.props;

    if (exportHistoryGetTypes.loading) {
      return <Spinner />;
    }

    const typeOptions = exportHistoryGetTypes.exportHistoryGetTypes || [];

    return <TypeForm {...this.props} typeOptions={typeOptions} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.exportHistoryGetTypes), {
      name: 'exportHistoryGetTypes'
    })
  )(FormContainer)
);

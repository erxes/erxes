import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import TypeForm from '../components/TypeForm';
import { queries } from '../../common/graphql';

type Props = {
  onChangeContentType: (contentType: string, skipFilter: boolean) => void;
  contentType: string;
};

type State = {};

type FinalProps = {
  historyGetTypes: any;
} & Props;

class FormContainer extends React.Component<FinalProps, State> {
  render() {
    const { historyGetTypes } = this.props;

    if (historyGetTypes.loading) {
      return <Spinner />;
    }

    const typeOptions = historyGetTypes.historyGetTypes || [];

    return <TypeForm {...this.props} typeOptions={typeOptions} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.historyGetTypes), {
      name: 'historyGetTypes'
    })
  )(FormContainer)
);

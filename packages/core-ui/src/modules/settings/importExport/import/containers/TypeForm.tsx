import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { IImportHistoryContentType } from '../../types';
import TypeForm from '../components/TypeForm';
import { queries } from '../../common/graphql';

type Props = {
  onChangeContentType: (value: IImportHistoryContentType) => void;
  contentTypes: IImportHistoryContentType[];
  type: string;
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

    return (
      <TypeForm
        onChangeContentType={this.props.onChangeContentType}
        contentTypes={this.props.contentTypes}
        type={this.props.type}
        typeOptions={typeOptions}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.historyGetTypes), {
      name: 'historyGetTypes'
    })
  )(FormContainer)
);

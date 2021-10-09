import React from 'react';
import * as compose from 'lodash.flowright';
import Move from '../../components/common/Move';

type State = {
  show: boolean;
};

type Props = {
  onChangeConnection: (discussionId: string) => void;
  queryParams: any;
  history: any;
};

class MoveContainer extends React.Component<Props, State> {
  render() {
    const extendedProps = {
      ...this.props
    };
    return <Move {...extendedProps} />;
  }
}

export default compose()(MoveContainer);

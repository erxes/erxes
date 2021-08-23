import PropertyForm from 'modules/segments/containers/form/PropertyForm';
import { ISegment } from 'modules/segments/types';
import React from 'react';

type Props = {
  segment: ISegment;
  contentType: string;
  index: number;
};

type State = {
  state: string;
};

class ConditionsList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { state: 'list' };
  }

  conditionsList = () => {
    const { segment, index, contentType } = this.props;
    const { conditions } = segment;

    if (!conditions && index === 0) {
      return <PropertyForm contentType={contentType} />;
    }

    return <div>'asdsad'</div>;
  };

  render() {
    const { state } = this.state;

    switch (state) {
      case 'list':
        return this.conditionsList();

      default:
        return this.conditionsList();
    }
  }
}

export default ConditionsList;

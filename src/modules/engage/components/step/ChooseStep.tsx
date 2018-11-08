import { FormControl, Icon } from 'modules/common/components';
import { colors, dimensions } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';

const RadioContainer = styled.div`
  border-bottom: 1px dotted ${colors.borderPrimary};

  > * {
    padding: ${dimensions.coreSpacing}px;
  }
`;

type Props = {};

type State = {
  createSegment: boolean;
  createTag: boolean;
};

class ChooseStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      // segmentId: props.segmentId || '',
      // tagId: props.tagId || '',
      createSegment: false,
      createTag: false
    };
  }

  createSegment = createSegment => {
    this.setState({ createSegment });
  };

  createTag = createTag => {
    this.setState({ createTag });
  };

  render() {
    return (
      <RadioContainer>
        <FormControl
          componentClass="radio"
          value={false}
          name="choice"
          checked={this.state.createSegment === false}
        >
          {__('Choose segment')}
        </FormControl>
        <FormControl
          componentClass="radio"
          value={false}
          name="choice"
          checked={this.state.createSegment === true}
        >
          {__('Create segment')}
        </FormControl>
        <FormControl
          componentClass="radio"
          value={false}
          name="choice"
          checked={this.state.createTag === false}
        >
          {__('Choose tag')}
        </FormControl>
        <FormControl
          componentClass="radio"
          value={false}
          name="choice"
          checked={this.state.createTag === true}
        >
          {__('Create tag')}
        </FormControl>
      </RadioContainer>
    );
  }
}

export default ChooseStep;

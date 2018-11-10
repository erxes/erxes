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

type Props = {
  onSelectOperation: (name: 'operation') => void;
};

type State = {
  operation: string;
};

class ChooseStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      operation: 'renderSegment'
    };
  }

  changeOperation = operation => {
    this.setState({ operation });
    this.props.onSelectOperation(operation);
  };

  render() {
    // TODO: is there any better way to do this?
    const renderSegment = () => this.changeOperation('renderSegment');
    const createSegment = () => this.changeOperation('createSegment');
    const renderTag = () => this.changeOperation('renderTag');
    const createTag = () => this.changeOperation('createTag');

    return (
      <RadioContainer>
        <FormControl
          componentClass="radio"
          value={false}
          name="operation"
          onChange={renderSegment}
          checked={this.state.operation === 'renderSegment'}
        >
          {__('Choose segment')}
        </FormControl>
        <FormControl
          componentClass="radio"
          value={false}
          name="operation"
          onChange={createSegment}
          checked={this.state.operation === 'createSegment'}
        >
          {__('Create segment')}
        </FormControl>
        <FormControl
          componentClass="radio"
          value={false}
          name="operation"
          onChange={renderTag}
          checked={this.state.operation === 'renderTag'}
        >
          {__('Choose tag')}
        </FormControl>
        <FormControl
          componentClass="radio"
          value={false}
          name="operation"
          onChange={createTag}
          checked={this.state.operation === 'createTag'}
        >
          {__('Create tag')}
        </FormControl>
      </RadioContainer>
    );
  }
}

export default ChooseStep;

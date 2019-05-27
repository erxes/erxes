import { Button, Tip } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { DealConsumer } from 'modules/deals/containers/DealContext';
import { HeaderLink } from 'modules/deals/styles/header';
import * as React from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { CirclePicker } from 'react-color';
import styled from 'styled-components';
import { backgroundColors } from '../constants';

const Picker = styled.div`
  position: relative;
  background: #fff;
  padding: 20px;
  border-radius: 14px;
`;

type Props = {
  pipelineId: string;
};

type State = {
  showPicker: boolean;
  color: string;
  target: any;
};

const overlayProps = {
  placement: 'bottom',
  rootClose: true,
  containerPadding: 20
};

class ColorChooser extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      showPicker: false,
      target: null,
      color: ''
    };
  }

  onHide = () => {
    this.setState({ showPicker: false });
  };

  toggleChooser = ({ target }) => {
    this.setState(s => ({ target, showPicker: !s.showPicker }));
  };

  renderChooser(onChange) {
    const { pipelineId } = this.props;
    const { color, target, showPicker } = this.state;

    return (
      <Overlay
        {...overlayProps}
        show={showPicker}
        onHide={this.toggleChooser}
        target={target}
      >
        <Popover id="popover-contained">
          <Picker>
            <CirclePicker
              color={color}
              onChange={onChange.bind(this, pipelineId)}
              colors={backgroundColors}
            />
          </Picker>
        </Popover>
      </Overlay>
    );
  }

  render() {
    return (
      <DealConsumer>
        {({ changeBackground }) => (
          <HeaderLink>
            <Tip text={__('Change background color')}>
              <Button
                btnStyle="link"
                className="filter-link"
                icon="paintpalette"
                onClick={this.toggleChooser}
              />
            </Tip>
            {this.renderChooser(changeBackground)}
          </HeaderLink>
        )}
      </DealConsumer>
    );
  }
}

export default ColorChooser;

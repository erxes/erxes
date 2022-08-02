import { __ } from 'coreui/utils';
import React from 'react';
import RTG from 'react-transition-group';
import { RightDrawerContainer } from '../../styles';
import { IDashboardItem } from '../../types';
import ChartRenderer from '../dashboard/ChartRenderer';
import Modal from 'react-bootstrap/Modal';

type Props = {
  showDrawer: boolean;
  item: IDashboardItem;
};

type State = {};

const deserializeItem = i => ({
  ...i,
  layout: JSON.parse(i.layout) || {},
  vizState: JSON.parse(i.vizState)
});

class ChartFrom extends React.Component<Props, State> {
  private wrapperRef;

  constructor(props) {
    super(props);
  }

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  render() {
    return (
      <>
        <div
          ref={this.setWrapperRef}
          style={{ width: 'calc( 100% - 500px)', padding: '2rem;' }}
        >
          <RTG.CSSTransition
            in={this.props.showDrawer}
            timeout={300}
            classNames="slide-in-left"
            unmountOnExit={true}
          >
            <ChartRenderer
              query={deserializeItem(this.props.item).vizState.query}
              chartType={deserializeItem(this.props.item).vizState.chartType}
              chartHeight={800}
            />
          </RTG.CSSTransition>
        </div>

        <div ref={this.setWrapperRef}>
          <RTG.CSSTransition
            in={this.props.showDrawer}
            timeout={300}
            classNames="slide-in-right"
            unmountOnExit={true}
          >
            <RightDrawerContainer>
              <div>123</div>
            </RightDrawerContainer>
          </RTG.CSSTransition>
        </div>
      </>
    );
  }
}

export default ChartFrom;

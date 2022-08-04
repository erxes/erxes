import { __ } from 'coreui/utils';
import React from 'react';
import RTG from 'react-transition-group';
import { FormChart, FormContainer, RightDrawerContainer } from '../../styles';
import { IDashboardItem } from '../../types';
import ChartRenderer from '../dashboard/ChartRenderer';
import { QueryBuilder } from '@cubejs-client/react';
import stateChangeHeuristics from './stateChangeHeuristics';

type Props = {
  showDrawer: boolean;
  item: IDashboardItem;
  vizState: any;
  setVizState?: any;
  cubejsApi?: any;
  type?: string;
  setType?: any;
  setIsDateRange?: any;
  isDateRange?: boolean;
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
    const { vizState, setVizState, cubejsApi } = this.props;

    return (
      <QueryBuilder
        vizState={deserializeItem(this.props.item).vizState}
        setVizState={setVizState}
        cubejsApi={cubejsApi}
        wrapWithQueryRenderer={false}
        stateChangeHeuristics={stateChangeHeuristics}
        render={({
          measures,
          availableMeasures,
          updateMeasures,
          dimensions,
          availableDimensions,
          updateDimensions,
          timeDimensions,
          availableTimeDimensions,
          updateTimeDimensions,
          isQueryPresent,
          chartType,
          updateChartType,
          validatedQuery,
          filters,
          updateFilters
        }) => {
          console.log(measures, availableMeasures);

          return (
            <FormContainer>
              <FormChart>
                <RTG.CSSTransition
                  in={this.props.showDrawer}
                  timeout={300}
                  classNames="slide-in-right"
                  unmountOnExit={true}
                >
                  <ChartRenderer
                    query={deserializeItem(this.props.item).vizState.query}
                    chartType={
                      deserializeItem(this.props.item).vizState.chartType
                    }
                    chartHeight={600}
                  />
                </RTG.CSSTransition>
              </FormChart>
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
            </FormContainer>
          );
        }}
      />
    );
  }
}

export default ChartFrom;

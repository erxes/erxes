import { __ } from 'coreui/utils';
import React from 'react';
import RTG from 'react-transition-group';
import {
  ActionFooter,
  Description,
  DrawerDetail,
  FormChart,
  FormContainer,
  RightDrawerContainer,
  ScrolledContent,
  SelectChartType
} from '../../styles';

import { IDashboardItem } from '../../types';
import ChartRenderer from '../dashboard/ChartRenderer';
import { QueryBuilder } from '@cubejs-client/react';
import stateChangeHeuristics from './stateChangeHeuristics';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';

import { CHART_TYPES } from '../../constants';
import DimensionForm from './DimensionForm';
import MeasureForm from './MeasureForm';
import TimeForm from './TimeForm';
import FilterForm from './FilterForm';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import { Alert } from '@erxes/ui/src/utils';

type Props = {
  showDrawer: boolean;
  item?: IDashboardItem;
  cubejsApi?: any;
  save: (params: { _id?: string; name: string; vizState: string }) => void;
  toggleDrawer: () => void;
  schemaTypes: string[];
};

type State = {
  vizState: any;
  name: string;
  type: string;
  isDateRange: boolean;
};

class ChartForm extends React.Component<Props, State> {
  private wrapperRef;
  private overlay: any;

  constructor(props) {
    super(props);

    const dashboardItem = props.item || {};

    this.state = {
      vizState: dashboardItem.vizState ? dashboardItem.vizState : {},
      type: dashboardItem.type,
      name: dashboardItem.name,
      isDateRange: dashboardItem.isDateRange || false
    };
  }

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  onOverlayClose = () => {
    this.overlay.hide();
  };

  setVizState = vizState => {
    this.setState({ vizState });
  };

  onChangeName = e => {
    const name = e.target.value;

    this.setState({ name });
  };

  onSave = () => {
    const { name, vizState, type } = this.state;
    const { item } = this.props;

    if (!name) {
      return Alert.success('Enter chart name');
    }
    if (!vizState) {
      return Alert.success('Build your query');
    }

    const doc = {
      _id: item ? item._id : '',
      name,
      vizState,
      type
    };

    this.props.save(doc);
  };

  setType = type => {
    this.setVizState({
      query: { dimensions: [], measures: [], timeDimensions: [] }
    });
    this.setState({ type });
  };

  render() {
    const { cubejsApi, schemaTypes } = this.props;
    const { vizState, name, type } = this.state;

    return (
      <QueryBuilder
        vizState={vizState}
        setVizState={this.setVizState}
        cubejsApi={cubejsApi}
        wrapWithQueryRenderer={false}
        stateChangeHeuristics={stateChangeHeuristics}
        render={args => {
          const {
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
            query,
            validatedQuery,
            filters,
            updateFilters
          } = args;

          return (
            <FormContainer>
              {isQueryPresent ? (
                <SelectChartType>
                  <FormGroup>
                    <ControlLabel>Chart type</ControlLabel>

                    <Select
                      options={CHART_TYPES.map(chartTypeValue => ({
                        label: chartTypeValue.title,
                        value: chartTypeValue.name
                      }))}
                      value={chartType}
                      onChange={m => updateChartType(m.value)}
                      placeholder={__('Choose chart')}
                    />
                  </FormGroup>
                </SelectChartType>
              ) : null}

              <FormChart>
                <RTG.CSSTransition
                  in={this.props.showDrawer}
                  timeout={300}
                  classNames="slide-in-right"
                  unmountOnExit={true}
                >
                  {isQueryPresent ? (
                    <>
                      <ChartRenderer
                        query={query}
                        chartType={chartType}
                        chartHeight={600}
                        filters={filters}
                        validatedQuery={validatedQuery}
                      />
                    </>
                  ) : (
                    <EmptyState
                      text={__('Build your custom query')}
                      image="/images/actions/21.svg"
                    />
                  )}
                </RTG.CSSTransition>
              </FormChart>
              <div ref={this.setWrapperRef}>
                <RightDrawerContainer>
                  <Description>
                    <h4>Build Your Query</h4>
                    <p>Choose a measure or dimension to get started</p>
                  </Description>
                  <ScrolledContent>
                    <DrawerDetail>
                      <FormGroup>
                        <ControlLabel required={true}>
                          {__('Name')}
                        </ControlLabel>

                        <FormControl
                          type="input"
                          onChange={this.onChangeName}
                          value={name}
                        />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel required={true}>
                          {__('Type')}
                        </ControlLabel>

                        <FormControl
                          componentClass="select"
                          value={type}
                          onChange={(e: any) => this.setType(e.target.value)}
                        >
                          <option key={''} value={''}>
                            {'Select Type'}
                          </option>
                          {schemaTypes.map(schemaType => {
                            return (
                              <option key={Math.random()} value={schemaType}>
                                {schemaType}
                              </option>
                            );
                          })}
                        </FormControl>
                      </FormGroup>
                      <MeasureForm
                        schemaType={type}
                        measures={measures}
                        availableMeasures={availableMeasures}
                        updateMeasures={updateMeasures}
                      />
                      <DimensionForm
                        schemaType={type}
                        dimensions={dimensions}
                        availableDimensions={availableDimensions}
                        updateDimensions={updateDimensions}
                      />
                      <TimeForm
                        schemaType={type}
                        timeDimensions={timeDimensions}
                        updateTimeDimensions={updateTimeDimensions}
                        availableTimeDimensions={availableTimeDimensions}
                      />
                      <FilterForm
                        schemaType={type}
                        filters={filters}
                        availableDimensions={availableDimensions}
                        updateFilters={updateFilters}
                      />
                    </DrawerDetail>

                    <ActionFooter>
                      <ModalFooter>
                        <Button
                          btnStyle="simple"
                          type="button"
                          onClick={this.props.toggleDrawer}
                          icon="times-circle"
                        >
                          {__('Cancel')}
                        </Button>
                        <Button
                          btnStyle="success"
                          icon="checked-1"
                          onClick={this.onSave}
                        >
                          Save
                        </Button>
                      </ModalFooter>
                    </ActionFooter>
                  </ScrolledContent>
                </RightDrawerContainer>
              </div>
            </FormContainer>
          );
        }}
      />
    );
  }
}

export default ChartForm;

import { __ } from 'coreui/utils';
import React from 'react';
import RTG from 'react-transition-group';
import {
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
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';

import { CHART_TYPES, DATE_RANGES } from '../../constants';
import DimensionForm from './DimensionForm';
import MeasureForm from './MeasureForm';

type Props = {
  showDrawer: boolean;
  item?: IDashboardItem;
  vizState?: any;
  setVizState?: any;
  cubejsApi?: any;
  type?: string;
  setType?: any;
  setIsDateRange?: any;
  isDateRange?: boolean;
};

type State = {
  vizState: any;
  name: string;
  type: string;
  isDateRange: boolean;
};

class ChartFrom extends React.Component<Props, State> {
  private wrapperRef;
  private overlay: any;

  constructor(props) {
    super(props);

    const dashboardItem = props.item || {};

    this.state = {
      vizState: dashboardItem.vizState
        ? JSON.parse(dashboardItem.vizState)
        : {},
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

  renderMemberGroup = ({ members, availableMembers, updateMembers, type }) => {
    const onChangeMeasure = (index, m) => {
      const measure = members[index];

      if (!m) {
        return updateMembers.remove(measure);
      }

      const value = JSON.parse(m.value);

      if (measure) {
        return updateMembers.update(measure, value);
      }

      updateMembers.add(value);
    };

    const renderMeasureValue = index => {
      if (members.length > 0) {
        const value = { ...members[index] } as any;
        delete value.index;

        return JSON.stringify(value);
      }
    };

    return (
      <>
        {members.map(member => {
          return (
            <FormGroup key={Math.random()}>
              <Select
                options={availableMembers.map(availableMember => ({
                  label: availableMember.title,
                  value: JSON.stringify(availableMember)
                }))}
                value={renderMeasureValue(member.index)}
                onChange={m => onChangeMeasure(member.index, m)}
                placeholder={__('Choose measure')}
              />
            </FormGroup>
          );
        })}

        <Select
          options={availableMembers.map(availableMember => ({
            label: availableMember.title,
            value: JSON.stringify(availableMember)
          }))}
          value={''}
          onChange={m => onChangeMeasure(100, m)}
          placeholder={__(`Choose ${type}`)}
        />
      </>
    );
  };

  renderTimeGroup = (
    timeDimensions,
    availableTimeDimensions,
    updateTimeDimensions
  ) => {
    const onChangeTimeDimensions = (index, m) => {
      const dimension = timeDimensions[index];

      if (!m) {
        return updateTimeDimensions.remove(dimension);
      }

      const value = JSON.parse(m.value);

      if (timeDimensions.length === 0) {
        return updateTimeDimensions.add({
          dimension: value,
          granularity: 'day',
          dateRange: 'This month'
        });
      }

      if (dimension) {
        return updateTimeDimensions.update(dimension, {
          ...dimension,
          dimension: value
        });
      }

      updateTimeDimensions.add({ dimension: value });
    };

    const onChangeDateRange = (index, value) => {
      const dimension = timeDimensions[index];

      if (dimension) {
        return updateTimeDimensions.update(dimension, {
          ...dimension,
          dateRange: value.value === 'All time' ? undefined : value.value
        });
      }
    };

    const renderDateRangeValue = value => {
      if (!value) {
        return 'All time';
      }

      return value;
    };

    const renderTimeDimensionValue = index => {
      if (timeDimensions.length > 0) {
        if (timeDimensions[index]) {
          const value = { ...timeDimensions[index].dimension } as any;

          delete value.index;
          delete value.granularities;

          return JSON.stringify(value);
        }
      }
    };

    if (timeDimensions.length === 0) {
      return (
        <FormGroup key={Math.random()}>
          <Select
            options={availableTimeDimensions.map(availableTimeDimension => ({
              label: availableTimeDimension.title,
              value: JSON.stringify(availableTimeDimension)
            }))}
            value={renderTimeDimensionValue(100)}
            onChange={value => onChangeTimeDimensions(100, value)}
            placeholder={__('Choose time dimension')}
          />
        </FormGroup>
      );
    }

    const renderGranularitiesOptions = timeDimension => {
      const dimension = timeDimension.dimension || {};

      const granularities = dimension.granularities || [];

      const updatedGranularities = [] as any;

      for (const granularitie of granularities) {
        if (!['Second', 'Minute'].includes(granularitie.title)) {
          updatedGranularities.push(granularitie);
        }
      }

      return updatedGranularities.map(granularitie => {
        return {
          label: granularitie.title,
          value: granularitie.name
        };
      });
    };

    const onChangeGranularites = (index, value) => {
      const dimension = timeDimensions[index];

      if (dimension) {
        if (value.value === 'hour') {
          return updateTimeDimensions.update(dimension, {
            ...dimension,
            dateRange: 'Today',
            granularity: value.value
          });
        }

        return updateTimeDimensions.update(dimension, {
          ...dimension,
          granularity: value.value === 'w/o grouping' ? undefined : value.value
        });
      }
    };

    const renderGranulariteValue = value => {
      if (!value) {
        return 'w/o grouping';
      }

      return value;
    };

    return (
      <>
        {timeDimensions.map(timeDimension => {
          return (
            <>
              <FormGroup key={Math.random()}>
                <Select
                  options={availableTimeDimensions.map(
                    availableTimeDimension => ({
                      label: availableTimeDimension.title,
                      value: JSON.stringify(availableTimeDimension)
                    })
                  )}
                  value={renderTimeDimensionValue(timeDimension.index)}
                  onChange={value =>
                    onChangeTimeDimensions(timeDimension.index, value)
                  }
                  placeholder={__('Choose time dimension')}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>For</ControlLabel>
                <Select
                  options={DATE_RANGES.map(dateRange => ({
                    label: dateRange.title || dateRange.value,
                    value: dateRange.value
                  }))}
                  value={renderDateRangeValue(timeDimension.dateRange)}
                  onChange={value =>
                    onChangeDateRange(timeDimension.index, value)
                  }
                  placeholder={__('Choose date range')}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>By</ControlLabel>
                <Select
                  options={renderGranularitiesOptions(timeDimension)}
                  value={renderGranulariteValue(timeDimension.granularity)}
                  onChange={value =>
                    onChangeGranularites(timeDimension.index, value)
                  }
                  placeholder={__('Choose date range')}
                />
              </FormGroup>
            </>
          );
        })}
      </>
    );
  };

  renderFilterGroup = (filters, updateFilters, availableDimensions) => {
    const onChangeFilterDimension = (filterIndex, m) => {
      const filter = filters[filterIndex];

      if (!m) {
        return updateFilters.remove(filter);
      }

      const dimension = JSON.parse(m.value);

      if (filter) {
        return updateFilters.update(filter, {
          ...filter,
          dimension
        });
      } else {
        return updateFilters.add({
          dimension
        });
      }
    };

    const onChangeOperator = (filterIndex, value) => {
      const filter = filters[filterIndex];

      updateFilters.update(filter, { ...filter, operator: value.value });
    };

    const renderFilterDimensionValue = index => {
      if (filters.length > 0) {
        const value = { ...filters[index] } as any;
        delete value.index;

        return JSON.stringify(value.dimension);
      }
    };

    const renderFilterOperatorValue = index => {
      const filter = filters[index];

      return filter.operator;
    };

    return (
      <>
        {filters.map(filter => {
          return (
            <>
              <FormGroup key={Math.random()}>
                <Select
                  options={availableDimensions.map(availableDimension => ({
                    label: availableDimension.title,
                    value: JSON.stringify(availableDimension)
                  }))}
                  value={renderFilterDimensionValue(filter.index)}
                  onChange={m => onChangeFilterDimension(filter.index, m)}
                  placeholder={__('Choose Dimension')}
                />
              </FormGroup>

              <ControlLabel>For</ControlLabel>

              <FormGroup key={Math.random()}>
                <Select
                  options={filter.operators.map(operator => ({
                    label: operator.title,
                    value: operator.name
                  }))}
                  value={renderFilterOperatorValue(filter.index)}
                  onChange={m => onChangeOperator(filter.index, m)}
                  placeholder={__('Choose ')}
                />
              </FormGroup>
            </>
          );
        })}

        <Select
          options={availableDimensions.map(availableDimension => ({
            label: availableDimension.title,
            value: JSON.stringify(availableDimension)
          }))}
          value={''}
          onChange={m => onChangeFilterDimension(100, m)}
          placeholder={__(`Choose Dimension`)}
        />
      </>
    );
  };

  render() {
    const { cubejsApi } = this.props;
    const { vizState } = this.state;

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
                      options={CHART_TYPES.map(type => ({
                        label: type.title,
                        value: type.name
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
                        query={validatedQuery}
                        chartType={chartType}
                        chartHeight={600}
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
                      <MeasureForm
                        measures={measures}
                        availableMeasures={availableMeasures}
                        updateMeasures={updateMeasures}
                      />

                      <DimensionForm
                        dimensions={dimensions}
                        availableDimensions={availableDimensions}
                        updateDimensions={updateDimensions}
                      />

                      <FormGroup>
                        <ControlLabel>Time</ControlLabel>

                        {this.renderTimeGroup(
                          timeDimensions,
                          availableTimeDimensions,
                          updateTimeDimensions
                        )}
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>Filter</ControlLabel>

                        {this.renderFilterGroup(
                          filters,
                          updateFilters,
                          availableDimensions
                        )}
                      </FormGroup>
                    </DrawerDetail>
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

export default ChartFrom;

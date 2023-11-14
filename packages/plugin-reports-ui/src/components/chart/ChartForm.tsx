import EmptyState from '@erxes/ui/src/components/EmptyState';
import React, { useEffect, useState } from 'react';
import RTG from 'react-transition-group';
import {
  ActionFooter,
  Description,
  DrawerDetail,
  FormChart,
  FormContainer,
  RightDrawerContainer,
  ScrolledContent
} from '../../styles';

import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';

import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __, router } from '@erxes/ui/src/utils';
import { IChart } from '../../types';
import ChartRenderer from './ChartRenderer';
import { CHART_TYPES } from './utils';

type Props = {
  toggleForm: () => void;

  history: any;
  queryParams: any;

  reportTemplates: any;
  showChatForm: boolean;

  chart?: IChart;

  chartsEdit: (values: any) => void;
  chartsAdd: (values: any) => void;
};
const ChartForm = (props: Props) => {
  const {
    toggleForm,
    history,
    reportTemplates,
    showChatForm,
    chart,
    chartsAdd,
    chartsEdit
  } = props;

  const [name, setName] = useState(chart?.name || '');
  const [chartType, setChartType] = useState<string>(chart?.chartType || 'bar');
  const [serviceType, setServiceType] = useState('');
  const [serviceTypes, setServiceTypes] = useState([]);

  useEffect(() => {
    setServiceTypes(reportTemplates.map(r => r.serviceName));
  }, [reportTemplates]);

  const onChangeName = (e: any) => {
    e.preventDefault();

    setName(e.target.value);
  };

  const onServiceTypeChange = selVal => {
    router.setParams(history, { serviceType: selVal.value });
    setServiceType(selVal.value);
  };

  const onChartTypeChange = chartSelVal => {
    setChartType(chartSelVal.value);
  };

  const renderChartTypes = Object.keys(CHART_TYPES).map(t => {
    return {
      label: CHART_TYPES[t],
      value: CHART_TYPES[t]
    };
  });

  const onSave = () => {
    chart ? chartsEdit({ chartType, name }) : chartsAdd({ chartType, name });
  };

  return (
    <FormContainer>
      {/* {isQueryPresent ? (
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
      ) : null} */}

      <FormChart>
        <RTG.CSSTransition
          in={showChatForm}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          {showChatForm ? (
            <ChartRenderer chartType={chartType} data={chart?.data} />
          ) : (
            <EmptyState
              text={__('Build your custom query')}
              image="/images/actions/21.svg"
            />
          )}
        </RTG.CSSTransition>
      </FormChart>
      <div>
        <RightDrawerContainer>
          <Description>
            <h4>Build Your Query</h4>
            <p>Choose a measure or dimension to get started</p>
          </Description>
          <ScrolledContent>
            <DrawerDetail>
              <FormGroup>
                <ControlLabel required={true}>{__('Name')}</ControlLabel>

                <FormControl
                  type="input"
                  onChange={onChangeName}
                  value={name}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>{__('Type')}</ControlLabel>

                <Select
                  options={serviceTypes.map(st => {
                    return {
                      label: st,
                      value: st
                    };
                  })}
                  value={serviceType}
                  onChange={onServiceTypeChange}
                  placeholder={__(`Choose Type`)}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel required={true}>{__('Chart type')}</ControlLabel>

                <Select
                  options={renderChartTypes}
                  value={chartType}
                  onChange={onChartTypeChange}
                  placeholder={__(`Choose chart`)}
                />
              </FormGroup>
            </DrawerDetail>

            <ActionFooter>
              <ModalFooter>
                <Button
                  btnStyle="simple"
                  type="button"
                  onClick={toggleForm}
                  icon="times-circle"
                >
                  {__('Cancel')}
                </Button>
                <Button btnStyle="success" icon="checked-1" onClick={onSave}>
                  Save
                </Button>
              </ModalFooter>
            </ActionFooter>
          </ScrolledContent>
        </RightDrawerContainer>
      </div>
    </FormContainer>
  );
};

export default ChartForm;

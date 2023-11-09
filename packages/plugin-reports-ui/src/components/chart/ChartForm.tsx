import React, { useState } from 'react';
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

import EmptyState from '@erxes/ui/src/components/EmptyState';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';

import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  serviceTypes: string[];
  toggleForm: () => void;
};
const ChartForm = (props: Props) => {
  const { serviceTypes, toggleForm } = props;

  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState(serviceTypes[0]);

  const onChangeName = (e: any) => {
    e.preventDefault();

    setName(e.target.value);
  };

  const onSave = () => {};
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
        {/* <RTG.CSSTransition
          // in={this.props.showDrawer}
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
        </RTG.CSSTransition> */}
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
                  onChange={m => setServiceType(m.value)}
                  placeholder={__(`Choose Type`)}
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

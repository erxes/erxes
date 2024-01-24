import EmptyState from '@erxes/ui/src/components/EmptyState';
import React, { useEffect, useState } from 'react';
import RTG from 'react-transition-group';
import {
  ActionFooter,
  Description,
  DrawerDetail,
  FlexColumn,
  FormChart,
  FormContainer,
  RightDrawerContainer,
  ScrolledContent,
} from '../../styles';

import {
  ControlLabel,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';

import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __, router } from '@erxes/ui/src/utils';
import ChartRenderer from '../../containers/chart/ChartRenderer';
import { IChart } from '../../types';
import ChartFormField, {
  IFilterType,
} from '../../containers/chart/ChartFormField';

type Props = {
  toggleForm: () => void;

  history: any;
  queryParams: any;

  chartTemplates: any[];
  showChartForm: boolean;

  chart?: IChart;
  serviceNames: string[];

  chartsEdit: (values: any, callback?: any) => void;
  chartsAdd: (values: any) => void;
};
const ChartForm = (props: Props) => {
  const {
    history,
    queryParams,
    toggleForm,
    chartTemplates,
    showChartForm,
    chart,
    chartsAdd,
    chartsEdit,

    serviceNames,
  } = props;

  const [name, setName] = useState(chart?.name || '');

  const [serviceName, setServiceName] = useState(chart?.serviceName || '');
  const [templateType, setChartTemplate] = useState(chart?.templateType || '');

  const [chartTypes, setChartTypes] = useState([]);
  const [chartType, setChartType] = useState<string>(chart?.chartType || 'bar');
  const [filterTypes, setFilterTypes] = useState<IFilterType[]>([]);
  const [filters, setFilters] = useState<any>(chart?.filter || {});

  useEffect(() => {
    const findChartTemplate = chartTemplates.find(
      (t) => t.templateType === templateType,
    );

    if (findChartTemplate) {
      setChartTypes(findChartTemplate.chartTypes);
      setFilterTypes(findChartTemplate.filterTypes);
    }
  }, [[...chartTemplates]]);

  const onChangeName = (e: any) => {
    e.preventDefault();
    setName(e.target.value);
  };

  const renderChartTemplates = chartTemplates.map((c) => ({
    label: c.name,
    value: c.templateType,
  }));

  const renderChartTypes = chartTypes.map((c) => ({ label: c, value: c }));

  const onServiceNameChange = (selVal) => {
    router.setParams(history, { serviceName: selVal.value });
    setServiceName(selVal.value);
  };

  const onChartTemplateChange = (selVal) => {
    router.setParams(history, { chartTemplateType: selVal.value });
    setName(selVal.label);
    setChartTemplate(selVal.value);
  };

  const onChartTypeChange = (chartSelVal) => {
    setChartType(chartSelVal.value);
  };

  const onSave = () => {
    chart
      ? chartsEdit(
          {
            _id: chart._id,
            chartType,
            name,
            filter: filters,
            serviceName,
            templateType,
          },
          toggleForm,
        )
      : chartsAdd({
          chartType,
          name,
          serviceName,
          templateType,
          filter: filters,
        });
  };

  const setFilter = (fieldName: string, value: any) => {
    if (!value || !value.length) {
      delete filters[fieldName];
      setFilters({ ...filters, ...chart?.filter });
      return;
    }

    setFilters({ ...filters, [fieldName]: value });
  };

  const renderFilterTypes = filterTypes.length ? (
    <FlexColumn style={{ gap: '20px' }}>
      {filterTypes.map((f: IFilterType) => (
        <ChartFormField
          initialValue={filters[f.fieldName]}
          filterType={f}
          key={f.fieldName}
          setFilter={setFilter}
        />
      ))}
    </FlexColumn>
  ) : (
    <></>
  );

  return (
    <FormContainer>
      <FormChart>
        <RTG.CSSTransition
          in={showChartForm}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          {showChartForm ? (
            <ChartRenderer
              chartType={chartType}
              chartVariables={{ serviceName, templateType }}
              filter={filters}
              history={history}
              queryParams={queryParams}
            />
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
                <ControlLabel required={true}>{__('Service')}</ControlLabel>

                <Select
                  options={serviceNames.map((st) => {
                    return {
                      label: st,
                      value: st,
                    };
                  })}
                  value={serviceName}
                  onChange={onServiceNameChange}
                  placeholder={__(`Choose service`)}
                />
              </FormGroup>

              {chartTemplates.length ? (
                <>
                  <FormGroup>
                    <ControlLabel required={true}>
                      {__('Chart template')}
                    </ControlLabel>

                    <Select
                      options={renderChartTemplates}
                      value={templateType}
                      onChange={onChartTemplateChange}
                      placeholder={__(`Choose template`)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel required={true}>
                      {__('Chart type')}
                    </ControlLabel>

                    <Select
                      options={renderChartTypes}
                      value={chartType}
                      onChange={onChartTypeChange}
                      placeholder={__(`Choose type`)}
                    />
                  </FormGroup>
                  <FormGroup>{renderFilterTypes}</FormGroup>
                </>
              ) : (
                <></>
              )}
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

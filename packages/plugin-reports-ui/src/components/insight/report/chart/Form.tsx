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
} from '../../../../styles';

import {
  ControlLabel,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components/form';
import Select from 'react-select-plus';

import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __, router } from '@erxes/ui/src/utils';
import ChartRenderer from '../../../../containers/chart/ChartRenderer';
import { IChart } from '../../../../types';
import ChartFormField, {
  IFilterType,
} from '../../../../containers/chart/ChartFormField';

const DIMENSION_OPTIONS = [
  { label: 'Team members', value: 'teamMember' },
  { label: 'Departments', value: 'department' },
  { label: 'Branches', value: 'branch' },
  { label: 'Source/Channel', value: 'source' },
  { label: 'Brands', value: 'brand' },
  { label: 'Tags', value: 'tag' },
  { label: 'Labels', value: 'label' },
  { label: 'Frequency (day, week, month)', value: 'frequency' },
  { label: 'Status', value: 'status' },
];

type Props = {
  history: any;
  queryParams: any;

  chart?: IChart;
  chartTemplates: any[];
  serviceNames: string[];

  chartsAdd: (values: any) => void;
  chartsEdit: (values: any) => void;
  setShowDrawer(showDrawer: boolean): void;
  updateServiceName(serviceName: string): void;
};

const Form = (props: Props) => {
  const {
    history,
    chart,
    chartTemplates,
    serviceNames,
    chartsAdd,
    chartsEdit,
    setShowDrawer,
    updateServiceName,
  } = props;

  const [name, setName] = useState(chart?.name || '');
  const [chartTypes, setChartTypes] = useState([]);
  const [serviceName, setServiceName] = useState(chart?.serviceName || '');
  const [templateType, setChartTemplate] = useState(chart?.templateType || '');
  const [chartType, setChartType] = useState<string>(chart?.chartType || 'bar');
  const [filterTypes, setFilterTypes] = useState<IFilterType[]>([]);
  const [filters, setFilters] = useState<any>(chart?.filter || {});
  const [dimension, setDimension] = useState<any>(chart?.dimension || {});

  const renderChartTypes = chartTypes.map((c) => ({ label: c, value: c }));
  const renderChartTemplates = chartTemplates.map((c) => ({
    label: c.name,
    value: c.templateType,
  }));

  useEffect(() => {
    const findChartTemplate = chartTemplates.find(
      (t) => t.templateType === templateType,
    );

    if (findChartTemplate) {
      setChartTypes(findChartTemplate.chartTypes);
      setFilterTypes(findChartTemplate.filterTypes);
    }
  }, [[...chartTemplates]]);

  const handleSubmit = () => {
    if (chart) {
      return chartsEdit({
        _id: chart._id,
        chartType,
        name,
        filter: filters,
        dimension,
        serviceName,
        templateType,
      });
    }

    chartsAdd({
      chartType,
      name,
      serviceName,
      templateType,
      filter: filters,
    });
  };

  const onServiceNameChange = (selVal) => {
    updateServiceName(selVal.value);
    setServiceName(selVal.value);
  };

  const onChartTemplateChange = (selVal) => {
    setName(selVal.label);
    setChartTemplate(selVal.value);
  };

  const onChartTypeChange = (chartSelVal) => {
    setChartType(chartSelVal.value);
  };

  const setFilter = (fieldName: string, value: any) => {
    if (!value) {
      delete filters[fieldName];
      setFilters({ ...filters });
      return;
    }

    if (!value.length) {
      delete filters[fieldName];
      setFilters({ ...filters });
      return;
    }

    filters[fieldName] = value;
    setFilters({ ...filters });
  };

  return (
    <>
      <Description>
        <h4>Build Your Query</h4>
        <p>Choose a measure or dimension to get started</p>
      </Description>
      <ScrolledContent>
        <FormGroup>
          <ControlLabel required={true}>{__('Name')}</ControlLabel>

          <FormControl
            type="input"
            onChange={(e) => setName((e.target as any).value)}
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
              <ControlLabel required={true}>{__('Chart type')}</ControlLabel>

              <Select
                options={renderChartTypes}
                value={chartType}
                onChange={onChartTypeChange}
                placeholder={__(`Choose type`)}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Dimension</ControlLabel>
              <Select
                options={DIMENSION_OPTIONS}
                value={dimension?.x}
                onChange={(sel) => setDimension({ x: sel.value })}
              />
            </FormGroup>
            <FormGroup>
              {filterTypes.length ? (
                <FlexColumn style={{ gap: '20px' }}>
                  {filterTypes.map((f: IFilterType) => (
                    <ChartFormField
                      initialValue={filters[f.fieldName]}
                      filterType={f}
                      key={f.fieldName}
                      setFilter={setFilter}
                      startDate={filters['startDate']}
                      endDate={filters['endDate']}
                    />
                  ))}
                </FlexColumn>
              ) : (
                <></>
              )}
            </FormGroup>
          </>
        ) : (
          <></>
        )}
        <ActionFooter>
          <ModalFooter>
            <Button
              btnStyle="simple"
              type="button"
              onClick={() => setShowDrawer(false)}
              icon="times-circle"
            >
              {__('Cancel')}
            </Button>
            <Button btnStyle="success" icon="checked-1" onClick={handleSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ActionFooter>
      </ScrolledContent>
    </>
  );
};

export default Form;

import React, { useEffect, useState } from 'react';
import Select from 'react-select-plus';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import ChartRenderer from '../../containers/chart/ChartRenderer';
import { Form as CommonForm } from '@erxes/ui/src/components/form';
import { FormColumn } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import ChartFormField, {
  IFilterType,
} from '../../containers/chart/ChartFormField';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

import {
  Description,
  FlexColumn,
  FormChart,
  FormContent,
  FormFooter,
  FormWrapper,
  DragField,
} from '../../styles';
import { IChart } from '../../types';

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

  item: any;
  type?: 'dashboard' | 'report';

  closeDrawer(): void;

  updateServiceName(serviceName: string): void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const Form = (props: Props) => {
  const {
    history,
    queryParams,
    chart,
    item,
    type,
    chartTemplates,
    serviceNames,
    renderButton,
    closeDrawer,
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
  const [dimensions, setDimensions] = useState<any>([]);

  useEffect(() => {
    if (type === 'report' && !chart) {
      updateServiceName(item?.serviceName || undefined);
      setServiceName(item?.serviceName || '');
    }
  }, [item?.serviceName]);

  const chartTypesOptions = chartTypes.map((c) => ({ label: c, value: c }));

  const chartTemplatesOptions = chartTemplates.map((c) => ({
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
      if (findChartTemplate.dimensions) {
        setDimensions(findChartTemplate.dimensions);
      }
    }
  }, [[...chartTemplates]]);

  const generateDoc = (values) => {

    const finalValues = values;
    if (chart) {
      finalValues._id = chart._id;
    }

    const doc: IChart = {
      _id: finalValues._id,
      contentId: item._id,
      chartType,
      name,
      filter: filters,
      dimension,
      serviceName,
      templateType,
    };

    if (!chart) {
      doc.contentType = type;
    }


    return doc;
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

    if (Array.isArray(value) && !value.length) {
      delete filters[fieldName];
      setFilters({ ...filters });
      return;
    }

    filters[fieldName] = value;

    setFilters({ ...filters });
    return;
  };

  const renderFilterTypeFields = () => {
    if (!filterTypes.length) {
      return null;
    }

    return (
      <FlexColumn style={{ gap: '20px' }}>
        {filterTypes.map((f: IFilterType) => (
          <ChartFormField
            initialValue={filters[f.fieldName]}
            filterType={f}
            fieldValues={filters}
            key={f.fieldName}
            setFilter={setFilter}
            startDate={filters['startDate']}
            endDate={filters['endDate']}
          />
        ))}
      </FlexColumn>
    );
  };

  const renderDimensions = () => {
    if (!dimensions.length) {
      return null;
    }

    return (
      <>
        <ControlLabel>Dimension</ControlLabel>
        <Select
          options={dimensions}
          value={dimension?.x}
          onChange={(sel) => setDimension({ x: sel.value })}
        />
      </>
    );
  };

  const renderFields = () => {
    if (!templateType) {
      return null
    }

    return <>
      <FormGroup>{renderDimensions()}</FormGroup>
      <FormGroup>{renderFilterTypeFields()}</FormGroup>
    </>
  }

  const renderChartTemplates = () => {
    if (!chartTemplates.length) {
      return null;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Chart template')}</ControlLabel>

          <Select
            options={chartTemplatesOptions}
            value={templateType}
            onChange={onChartTemplateChange}
            placeholder={__(`Choose template`)}
            clearable={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__('Chart type')}</ControlLabel>

          <Select
            options={chartTypesOptions}
            value={chartType}
            onChange={onChartTypeChange}
            placeholder={__(`Choose type`)}
            clearable={false}
          />
        </FormGroup>
        {renderFields()}
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <FormWrapper>
        <FormColumn className="left-column">
          <DragField
            cols={2 * 3}
            margin={[40, 40]}
            rowHeight={160}
            containerPadding={[40, 40]}
            useCSSTransforms={true}
          >
            <div
              key={Math.random()}
              data-grid={{ x: 0, y: 0, w: 6, h: 4.5, static: true }}
            >
              <ChartRenderer
                chartType={chartType}
                chartVariables={{ serviceName, templateType }}
                filter={filters}
                dimension={dimension}
                history={history}
                queryParams={queryParams}
                chartHeight={800}
              />
            </div>
          </DragField>
        </FormColumn>
        <FormColumn className="right-column">
          <FormContent>
            <Description>
              <h4>Build Your Query</h4>
              <p>Choose a measure or dimension to get started</p>
            </Description>

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
                clearable={false}
              />
            </FormGroup>

            {renderChartTemplates()}
          </FormContent>

          <FormFooter>
            <Button
              btnStyle="simple"
              type="button"
              onClick={closeDrawer}
              icon="times-circle"
            >
              {__('Cancel')}
            </Button>

            {renderButton({
              name: 'Chart',
              values: generateDoc(values),
              isSubmitted,
              object: props.chart,
            })}
          </FormFooter>
        </FormColumn>
      </FormWrapper>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;

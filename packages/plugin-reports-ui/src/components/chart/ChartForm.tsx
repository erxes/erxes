import {
  ActionFooter,
  Description,
  DrawerDetail,
  FlexColumn,
  FormChart,
  FormContainer,
  RightDrawerContainer,
  ScrolledContent,
} from "../../styles";
import ChartFormField, {
  IFilterType,
} from "../../containers/chart/ChartFormField";
import {
  ControlLabel,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components/form";
import React, { useEffect, useState } from "react";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "@erxes/ui/src/components/Button";
import { CSSTransition } from "react-transition-group";
import ChartRenderer from "../../containers/chart/ChartRenderer";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import { IChart } from "../../types";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import Select from "react-select";

const DIMENSION_OPTIONS = [
  { label: "Team members", value: "teamMember" },
  { label: "Departments", value: "department" },
  { label: "Branches", value: "branch" },
  { label: "Source/Channel", value: "source" },
  { label: "Brands", value: "brand" },
  { label: "Tags", value: "tag" },
  { label: "Labels", value: "label" },
  { label: "Frequency (day, week, month)", value: "frequency" },
  { label: "Status", value: "status" },
];
type Props = {
  toggleForm: () => void;

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
    queryParams,
    toggleForm,
    chartTemplates,
    showChartForm,
    chart,
    chartsAdd,
    chartsEdit,

    serviceNames,
  } = props;

  const location = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState(chart?.name || "");

  const [serviceName, setServiceName] = useState(chart?.serviceName || "");
  const [templateType, setChartTemplate] = useState(chart?.templateType || "");

  const [chartTypes, setChartTypes] = useState([]);
  const [chartType, setChartType] = useState<string>(chart?.chartType || "bar");
  const [filterTypes, setFilterTypes] = useState<IFilterType[]>([]);
  const [filters, setFilters] = useState<any>(chart?.filter || {});
  const [dimension, setDimension] = useState<any>(chart?.dimension || {});
  const [dimensions, setDimensions] = useState<any>([]);

  useEffect(() => {
    const findChartTemplate = chartTemplates.find(
      (t) => t.templateType === templateType
    );

    if (findChartTemplate) {
      setChartTypes(findChartTemplate.chartTypes);
      setFilterTypes(findChartTemplate.filterTypes);
      if (findChartTemplate.dimensions) {
        setDimensions(findChartTemplate.dimensions);
      }
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
    router.setParams(navigate, location, { serviceName: selVal.value });
    setServiceName(selVal.value);
  };

  const onChartTemplateChange = (selVal) => {
    router.setParams(navigate, location, { chartTemplateType: selVal.value });
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
            dimension,
            serviceName,
            templateType,
          },
          toggleForm
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

  const renderFilterTypes = filterTypes.length ? (
    <FlexColumn style={{ gap: "20px" }}>
      {filterTypes.map((f: IFilterType) => (
        <ChartFormField
          initialValue={filters[f.fieldName]}
          filterType={f}
          fieldValues={filters}
          key={f.fieldName}
          setFilter={setFilter}
          startDate={filters["startDate"]}
          endDate={filters["endDate"]}
        />
      ))}
    </FlexColumn>
  ) : (
    <></>
  );

  const renderDimensionSelection = (
    <Select
      options={dimensions}
      value={dimensions.find((o) => o.value === dimension?.x)}
      isClearable={true}
      onChange={(sel) => setDimension({ x: sel.value })}
    />
  );

  const serviceOptions = serviceNames.map((st) => {
    return {
      label: st,
      value: st,
    };
  });

  return (
    <FormContainer>
      <FormChart>
        <CSSTransition
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
              dimension={dimension}
              queryParams={queryParams}
            />
          ) : (
            <EmptyState
              text={__("Build your custom query")}
              image="/images/actions/21.svg"
            />
          )}
        </CSSTransition>
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
                <ControlLabel required={true}>{__("Name")}</ControlLabel>

                <FormControl
                  type="input"
                  onChange={onChangeName}
                  value={name}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>{__("Service")}</ControlLabel>

                <Select
                  options={serviceOptions}
                  value={serviceOptions.find((o) => o.value === serviceName)}
                  onChange={onServiceNameChange}
                  isClearable={true}
                  placeholder={__(`Choose service`)}
                  menuPlacement="auto"
                />
              </FormGroup>

              {chartTemplates.length ? (
                <>
                  <FormGroup>
                    <ControlLabel required={true}>
                      {__("Chart template")}
                    </ControlLabel>

                    <Select
                      options={renderChartTemplates}
                      value={renderChartTemplates.find(
                        (o) => o.value === templateType
                      )}
                      onChange={onChartTemplateChange}
                      isClearable={true}
                      placeholder={__(`Choose template`)}
                      menuPlacement="auto"
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel required={true}>
                      {__("Chart type")}
                    </ControlLabel>

                    <Select
                      options={renderChartTypes}
                      value={renderChartTypes.find(
                        (o) => o.value === chartType
                      )}
                      onChange={onChartTypeChange}
                      isClearable={true}
                      placeholder={__(`Choose type`)}
                      menuPlacement="auto"
                    />
                  </FormGroup>
                  {dimensions.length ? (
                    <FormGroup>
                      <ControlLabel>Dimension</ControlLabel>
                      {renderDimensionSelection}
                    </FormGroup>
                  ) : (
                    <></>
                  )}
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
                  {__("Cancel")}
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

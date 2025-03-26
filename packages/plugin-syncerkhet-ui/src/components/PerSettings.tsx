import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  SelectWithSearch
} from "@erxes/ui/src/components";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import { queries as boardQueries } from "@erxes/ui-sales/src/boards/graphql";
import { __ } from "@erxes/ui/src/utils";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import Select from "react-select";
import React from "react";
import { IConfigsMap } from "../types";
import { FieldsCombinedByType } from "../../../ui-forms/src/settings/properties/types";
import { queries as formQueries } from "@erxes/ui-forms/src/forms/graphql";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import { FlexRow } from "@erxes/ui-settings/src/styles";

const ebarimtProductRules = `
  query ebarimtProductRules(
    $searchValue: String,
    $kind: String,
  ) {
    ebarimtProductRules(
      searchValue: $searchValue,
      kind: $kind,
    ) {
      _id
      title
    }
  }
`;

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

type State = {
  config: any;
  hasOpen: boolean;
  fieldsCombined: FieldsCombinedByType[];
  pipeline?: any;
};

class PerSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false,
      fieldsCombined: []
    };

    if (props.config.pipelineId) {
      client.query({
        query: gql(boardQueries.pipelineDetail),
        variables: { _id: props.config.pipelineId },
      }).then(({ data }) => {
        this.setState({ pipeline: data?.salesPipelineDetail || {} })
      })
    }

    client
      .query({
        query: gql(formQueries.fieldsCombinedByContentType),
        variables: {
          contentType: "sales:deal"
        }
      })
      .then(({ data }) => {
        this.setState({
          fieldsCombined: data?.fieldsCombinedByContentType || []
        });
      });
  }

  onChangeBoard = (boardId: string) => {
    this.setState({ config: { ...this.state.config, boardId } });
  };

  onChangePipeline = (pipelineId: string) => {
    this.setState({ config: { ...this.state.config, pipelineId } }, () => {
      if (pipelineId) {
        client.query({
          query: gql(boardQueries.pipelineDetail),
          variables: { _id: pipelineId },
        }).then(({ data }) => {
          this.setState({ pipeline: data?.salesPipelineDetail || {} })
        })
      }
    });
  };

  onChangeStage = (stageId: string) => {
    this.setState({ config: { ...this.state.config, stageId } });
  };

  onSave = e => {
    e.preventDefault();
    const { configsMap, currentConfigKey } = this.props;
    const { config } = this.state;
    const key = config.stageId;

    const map = { ...configsMap.ebarimtConfig };
    delete map[currentConfigKey];
    map[key] = config;
    this.props.save({ ...configsMap, ebarimtConfig: map });
  };

  onDelete = e => {
    e.preventDefault();

    this.props.delete(this.props.currentConfigKey);
  };

  onChangeCombo = (option, code) => {
    this.onChangeConfig(code, option.value);
  };

  onChangeCheckbox = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    this.setState({ config: { ...config, [code]: value } });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onresponseCustomFieldChange = option => {
    const value = !option ? "" : option.value.toString();
    this.onChangeConfig("responseField", value);
  };

  renderInput = (key: string, title?: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={config[key]}
          onChange={this.onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  renderCheckbox = (key: string, title?: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={config[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentclass="checkbox"
        />
      </FormGroup>
    );
  };

  generateRuleOptions = (array) => array.map(item => ({
    value: item._id,
    label: item.title || ''
  }));

  render() {
    const { config } = this.state;
    const payOptions = [
      { value: "debtAmount", label: "Зээлийн данс" },
      { value: "cashAmount", label: "Бэлэн мөнгө данс" },
      { value: "cardAmount", label: "Картын данс" },
      { value: "card2Amount", label: "Картын данс нэмэлт" },
      { value: "mobileAmount", label: "Мобайл данс" },
      { value: "debtBarterAmount", label: "Бартер данс" },
      { value: "preAmount", label: "Урьдчилгаа данс" },
    ];
    const payOptionsWithNull = [{ value: "", label: "Өрөөсөн баримтаар" }, ...payOptions];
    const responseFieldOptions = (this.state.fieldsCombined || []).map(f => ({
      value: f.name,
      label: f.label
    }));
    return (
      <CollapseContent
        title={__(config.title)}
        beforeTitle={<Icon icon="settings" />}
        transparent={true}
        open={this.props.currentConfigKey === "newEbarimtConfig" ? true : false}
      >
        <FormGroup>
          <ControlLabel>{"Title"}</ControlLabel>
          <FormControl
            defaultValue={config.title}
            onChange={this.onChangeInput.bind(this, "title")}
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <BoardSelectContainer
                type="deal"
                autoSelectStage={false}
                boardId={config.boardId}
                pipelineId={config.pipelineId}
                stageId={config.stageId}
                onChangeBoard={this.onChangeBoard}
                onChangePipeline={this.onChangePipeline}
                onChangeStage={this.onChangeStage}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Choose response field")}</ControlLabel>
              <Select
                name="responseField"
                value={responseFieldOptions.find(
                  o => o.value === config.responseField
                )}
                onChange={this.onresponseCustomFieldChange}
                isClearable={true}
                options={responseFieldOptions}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            {this.renderInput("userEmail", "userEmail", "")}
            {this.renderCheckbox("hasVat", "hasVat", "")}
            {this.state.config.hasVat && (
              <FormGroup>
                <ControlLabel>Another rules of products on vat</ControlLabel>
                <SelectWithSearch
                  label={'reverseVatRules'}
                  queryName="ebarimtProductRules"
                  name={'reverseVatRules'}
                  initialValue={this.state.config['reverseVatRules']}
                  generateOptions={this.generateRuleOptions}
                  onSelect={ids => {
                    this.onChangeConfig("reverseVatRules", ids);
                  }}
                  filterParams={{ kind: 'vat' }}
                  customQuery={ebarimtProductRules}
                  multi={true}
                />
              </FormGroup>
            ) || <></>}
            {this.renderCheckbox("hasCitytax", "hasCitytax", "")}
            {!this.state.config.hasCitytax && (
              <FormGroup>
                <ControlLabel>Another rules of products on citytax</ControlLabel>
                <SelectWithSearch
                  label={'reverseCtaxRules'}
                  queryName="ebarimtProductRules"
                  name={'reverseCtaxRules'}
                  initialValue={this.state.config['reverseCtaxRules']}
                  generateOptions={this.generateRuleOptions}
                  onSelect={ids => {
                    this.onChangeConfig("reverseCtaxRules", ids);
                  }}
                  filterParams={{ kind: 'ctax' }}
                  customQuery={ebarimtProductRules}
                  multi={true}
                />
              </FormGroup>
            ) || <></>}

          </FormColumn>
        </FormWrapper>
        <FlexRow>
          <FormGroup>
            <ControlLabel>{"defaultPay"}</ControlLabel>
            <Select
              value={payOptionsWithNull.find(o => o.value === config.defaultPay) || ""}
              onChange={option => this.onChangeCombo(option, 'defaultPay')}
              isClearable={true}
              options={payOptionsWithNull}
            />
          </FormGroup>
          {config.defaultPay && (this.state.pipeline?.paymentTypes || []).map((payType) => (
            <FormGroup>
              <ControlLabel>{payType.title}</ControlLabel>
              <Select
                value={payOptions.find(o => o.value === config[payType.type])}
                onChange={option => this.onChangeCombo(option, payType.type)}
                isClearable={false}
                required={true}
                options={payOptions}
              />
            </FormGroup>
          ))}
        </FlexRow>
        <ModalFooter>
          <Button
            btnStyle="danger"
            icon="cancel-1"
            onClick={this.onDelete}
            uppercase={false}
          >
            Delete
          </Button>

          <Button
            btnStyle="success"
            icon="check-circle"
            onClick={this.onSave}
            uppercase={false}
            disabled={config.stageId ? false : true}
          >
            Save
          </Button>
        </ModalFooter>
      </CollapseContent>
    );
  }
}
export default PerSettings;

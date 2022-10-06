import { Content, LeftContent, ImportHeader } from '../../styles';
import { Step, Steps } from '@erxes/ui/src/components/step';
import ConfigsForm from '../containers/ConfigsForm';
import React from 'react';
import TypeForm from '../containers/TypeForm';
import Wrapper from 'modules/layout/components/Wrapper';
import { Alert, __ } from 'modules/common/utils';
import { FlexPad } from 'modules/common/components/step/styles';
import { Description, SubHeading } from '@erxes/ui-settings/src/styles';
import { loadDynamicComponent } from 'modules/common/utils';
import { StepButton } from '@erxes/ui/src/components/step/styles';
import Details from './Details';
import Button from 'modules/common/components/Button';

type Props = {
  count: string;
  loading: boolean;
  saveExport: (doc: any) => void;
};

type State = {
  segmentData: any;
  contentType: string;
  disclaimer: boolean;
  exportName: string;
  columns: any[];
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      segmentData: {},
      contentType: '',
      disclaimer: false,
      exportName: '',
      columns: []
    };
  }

  shouldComponentUpdate(_nextProps, nextState) {
    if (nextState.segmentData !== this.state.segmentData) {
      return false;
    }

    return true;
  }

  onChangeContentType = (contentType: string) => {
    this.setState({ contentType });
  };

  onClickField = columns => {
    this.setState({ columns });
  };

  onChangeExportName = value => {
    this.setState({ exportName: value });
  };

  onChangeDisclaimer = value => {
    this.setState({ disclaimer: value });
  };

  segmentCloseModal = () => {
    this.setState({ segmentData: {} });
  };
  onSubmit = () => {
    const {
      contentType,
      columns,
      segmentData,
      exportName,
      disclaimer
    } = this.state;

    let columnsConfig = columns.filter(conf => conf.checked) as any;

    columnsConfig = columnsConfig.map(conf => {
      return conf.name;
    });

    const doc = {
      contentType: contentType,
      columnsConfig: columnsConfig,
      segmentData: segmentData,
      exportName,
      disclaimer
    };
    console.log(columnsConfig, '<===========columnsConfig');
    console.log(contentType, '<===========contentType');
    console.log(segmentData, '<===========segmentData');
    window.location.href = `/settings/exportHistories?type=${contentType}`;

    return this.props.saveExport(doc);
  };

  renderExportButton = () => {
    const { disclaimer, exportName } = this.state;
    if (disclaimer && exportName) {
      return (
        <StepButton next={true} onClick={this.onSubmit}>
          Export
        </StepButton>
      );
    }
    return <></>;
  };

  filterContent = (values: any) => {
    return (
      <>
        <Button
          id="segment-filter"
          onClick={() => {
            const data = {
              ...values,
              conditions: values.conditionSegments[0].conditions
            };

            delete data.conditionSegments;

            console.log(data.conditions, '<------------------DA');

            this.setState({ segmentData: data });

            Alert.success('Success');
          }}
          icon="filter"
        >
          {'Apply Filter'}
        </Button>
      </>
    );
  };

  render() {
    const { contentType, disclaimer, exportName } = this.state;

    const title = __('Import');

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import & Export'), link: '/settings/importHistories' },
      { title }
    ];

    const content = (
      <Content>
        <LeftContent>
          <Steps active={1} direction="horizontal">
            <Step title="Type" link="exportHistories">
              <TypeForm
                onChangeContentType={this.onChangeContentType}
                contentType={contentType}
              />
            </Step>
            <Step title="Content">
              <FlexPad
                direction="column"
                overflow="auto"
                thinner={true}
                vh={70}
              >
                <ImportHeader>{__(`Choose your content type`)}</ImportHeader>
                <ImportHeader fontSize="small">
                  {__(
                    'Before you choose content fields, make sure your content type is ready to be selected.'
                  )}
                </ImportHeader>
                <ConfigsForm
                  onClickField={this.onClickField}
                  contentType={contentType}
                />
              </FlexPad>
            </Step>
            <Step title="Filter">
              <FlexPad
                direction="column"
                overflow="auto"
                thinner={true}
                vh={70}
              >
                <SubHeading>{__('Filter')}</SubHeading>
                <Description>
                  {__('Skip this step if you wish to export all items')}
                </Description>
                {loadDynamicComponent('importExportFilterForm', {
                  ...this.props,
                  contentType: contentType,
                  closeModal: this.segmentCloseModal,
                  filterContent: this.filterContent,
                  hideDetailForm: true
                })}
              </FlexPad>
            </Step>
            <Step title="Detail" additionalButton={this.renderExportButton()}>
              <Details
                type="stepper"
                disclaimer={disclaimer}
                exportName={exportName}
                onChangeExportName={this.onChangeExportName}
                onChangeDisclaimer={this.onChangeDisclaimer}
              />
            </Step>
          </Steps>
        </LeftContent>
      </Content>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={__('')} breadcrumb={breadcrumb} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default Form;

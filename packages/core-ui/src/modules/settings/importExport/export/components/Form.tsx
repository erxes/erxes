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
  contentType: string;
};

type State = {
  segmentData: any;
  contentType: string;
  disclaimer: boolean;
  name: string;
  columns: any[];
  skipFilter: boolean;
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      segmentData: {},
      contentType: props.contentType || '',
      disclaimer: false,
      name: '',
      columns: [],
      skipFilter: false
    };
  }

  shouldComponentUpdate(_nextProps, nextState) {
    if (nextState.segmentData !== this.state.segmentData) {
      return false;
    }

    return true;
  }

  onChangeContentType = (contentType: string, skipFilter: boolean) => {
    this.setState({ contentType });
    this.setState({ skipFilter });
  };

  onClickField = columns => {
    this.setState({ columns });
  };

  onChangeExportName = value => {
    this.setState({ name: value });
  };

  onChangeDisclaimer = value => {
    this.setState({ disclaimer: value });
  };

  segmentCloseModal = () => {
    this.setState({ segmentData: {} });
  };

  onSubmit = () => {
    const { contentType, columns, segmentData, name } = this.state;

    let columnsConfig = columns.filter(conf => conf.checked) as any;

    columnsConfig = columnsConfig.map(conf => {
      return conf.name;
    });

    const doc = {
      contentType,
      columnsConfig,
      segmentData,
      name
    };

    return this.props.saveExport(doc);
  };

  renderExportButton = () => {
    const { disclaimer, name } = this.state;
    if (disclaimer && name) {
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
      <Button
        id="segment-filter"
        onClick={() => {
          const data = {
            ...values,
            conditions: values.conditionSegments[0].conditions
          };

          delete data.conditionSegments;

          this.setState({ segmentData: data });

          Alert.success('Success');
        }}
        icon="filter"
      >
        {'Apply Filter'}
      </Button>
    );
  };

  render() {
    const { contentType, disclaimer, name, skipFilter } = this.state;

    const title = __('Export');

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

            {!skipFilter && (
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
                    contentType,
                    closeModal: this.segmentCloseModal,
                    filterContent: this.filterContent,
                    hideDetailForm: true
                  })}
                </FlexPad>
              </Step>
            )}

            <Step title="Detail" additionalButton={this.renderExportButton()}>
              <Details
                type="stepper"
                disclaimer={disclaimer}
                name={name}
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

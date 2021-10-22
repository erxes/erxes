import Button from 'modules/common/components/Button';
import { Step, Steps } from 'modules/common/components/step';
import {
  ControlWrapper,
  FlexItem,
  FlexPad,
  Indicator,
  Preview,
  StepWrapper
} from 'modules/common/components/step/styles';
import { getEnv, __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { SegmentsForm } from 'modules/segments/containers';
import { IConfigColumn } from 'modules/settings/properties/types';
import React from 'react';
import { Link } from 'react-router-dom';
import ConfigsForm from './ConfigsForm';
import queryString from 'query-string';
import { Description, SubHeading } from 'modules/settings/styles';
import SettingsForm from './SettingsForm';
import {
  Content,
  ImageWrapper,
  LeftContent,
  MessengerPreview,
  TextWrapper
} from 'modules/settings/integrations/styles';
import Spinner from 'modules/common/components/Spinner';

type Props = {
  contentType: string;
  columns: IConfigColumn[];
  count: number;
  loading: boolean;
  previewCount: (segmentId?: string) => void;
};

type State = {
  segmentId: string;
  configs: string[];
  searchValue: string;
  columns: IConfigColumn[];
  importType: string;
  columnsConfig: IConfigColumn[];
};

const { REACT_APP_API_URL } = getEnv();

class ExportForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      segmentId: '',
      configs: [],
      searchValue: '',
      columns: props.columns,
      columnsConfig: [],
      importType: 'csv'
    };
  }

  addFilter = segmentId => {
    this.setState({ segmentId });

    this.props.previewCount(segmentId);
  };

  onSearch = e => {
    const value = e.target.value;

    this.setState({ searchValue: value });
  };

  onSubmit = () => {
    const { contentType } = this.props;
    const { columns, segmentId } = this.state;

    const columnsConfig = columns.filter(conf => conf.checked);

    const stringified = queryString.stringify({
      configs: JSON.stringify(columnsConfig),
      type: contentType,
      segment: segmentId,
      unlimited: true
    });

    window.open(`${REACT_APP_API_URL}/file-export?${stringified}`, '_blank');
    window.location.href = `/settings/importHistories?type=${contentType}`;
  };

  onClickField = (checked, field) => {
    const { columns } = this.state;

    for (const column of columns) {
      if (column._id === field._id) {
        column.checked = checked;
      }
    }

    this.setState({ columns });
  };

  segmentCloseModal = () => {
    this.setState({ segmentId: '' });

    this.props.previewCount();
  };

  render() {
    const { contentType, count, loading } = this.props;
    const { segmentId, searchValue, columns } = this.state;

    const title = __('Export');

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import & Export'), link: '/settings/importHistories' },
      { title }
    ];

    return (
      <StepWrapper>
        <Wrapper.Header title={title} breadcrumb={breadcrumb} />
        <Content>
          <LeftContent>
            <Steps active={1}>
              <Step img="/images/icons/erxes-10.svg" title="Content">
                <ConfigsForm
                  columns={columns}
                  onClickField={this.onClickField}
                  onSearch={this.onSearch}
                  searchValue={searchValue}
                />
              </Step>

              <Step img="/images/icons/erxes-14.svg" title="Filter">
                <FlexItem>
                  <FlexPad direction="column" overflow="auto">
                    <SubHeading>{__('Filter')}</SubHeading>
                    <Description>
                      {__('Skip this step if you wish to export all items')}
                    </Description>
                    <SegmentsForm
                      {...this.props}
                      id={segmentId}
                      contentType={contentType || 'customer'}
                      closeModal={this.segmentCloseModal}
                      addFilter={this.addFilter}
                      hideDetailForm={true}
                      usageType={'export'}
                    />
                  </FlexPad>
                </FlexItem>
              </Step>

              <Step
                img="/images/icons/erxes-07.svg"
                title="Settings"
                noButton={true}
              >
                <SettingsForm />
              </Step>
            </Steps>

            <ControlWrapper>
              <Indicator>
                {__('You are exporting')}
                <strong> {this.props.contentType} </strong>
                {__('data')}
              </Indicator>
              <Button.Group>
                <Link to="settings/importHistories">
                  <Button btnStyle="simple" icon="times-circle">
                    Cancel
                  </Button>
                </Link>

                <Button btnStyle="success" onClick={this.onSubmit}>
                  Export
                </Button>
              </Button.Group>
            </ControlWrapper>
          </LeftContent>
          <MessengerPreview>
            <Preview fullHeight={true}>
              <ImageWrapper>
                <TextWrapper>
                  {loading ? (
                    <Spinner objective={true} />
                  ) : (
                    <h1>
                      {__('Items found:')} {count}
                    </h1>
                  )}
                </TextWrapper>
              </ImageWrapper>
            </Preview>
          </MessengerPreview>
        </Content>
      </StepWrapper>
    );
  }
}

export default ExportForm;

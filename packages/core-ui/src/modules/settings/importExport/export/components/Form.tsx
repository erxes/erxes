import { Content, LeftContent, MessengerPreview } from '../../styles';
import {
  ControlWrapper,
  FlexItem,
  FlexPad,
  Indicator,
  Preview,
  StepWrapper
} from 'modules/common/components/step/styles';
import { Description, SubHeading } from '@erxes/ui-settings/src/styles';
import { ImageWrapper, TextWrapper } from '@erxes/ui/src/styles/main';
import { Step, Steps } from 'modules/common/components/step';
import { __, getEnv } from 'modules/common/utils';

import Button from 'modules/common/components/Button';
import ConfigsForm from './ConfigsForm';
import { Link } from 'react-router-dom';
import React from 'react';
import Spinner from 'modules/common/components/Spinner';
import Wrapper from 'modules/layout/components/Wrapper';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';
import path from 'path';
import queryString from 'query-string';

const SegmentsForm = asyncComponent(
  () =>
    isEnabled('segments') &&
    path.resolve(
      /* webpackChunkName: "SegmentsForm" */ '@erxes/ui-segments/src/containers/form/SegmentsForm'
    )
);

type Props = {
  contentType: string;
  columns: any[]; //check
  count: string;
  loading: boolean;
  previewCount: (segmentId?: string) => void;
};

type State = {
  segmentId: string;
  configs: string[];
  searchValue: string;
  columns: any[]; //check
  importType: string;
  columnsConfig: any[]; //check
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

    const serviceType = contentType.split(':')[0];

    let columnsConfig = columns.filter(conf => conf.checked) as any;

    columnsConfig = columnsConfig.map(conf => {
      return conf.name;
    });

    const stringified = queryString.stringify({
      configs: JSON.stringify(columnsConfig),
      type: contentType.split(':')[1],
      segment: segmentId,
      unlimited: true
    });

    window.open(
      `${REACT_APP_API_URL}/pl:${serviceType}/file-export?${stringified}`,
      '_blank'
    );

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

              <Step
                img="/images/icons/erxes-14.svg"
                title="Filter"
                noButton={true}
              >
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

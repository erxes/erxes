import { Content, LeftContent } from '../../styles';
import { Step, Steps, ExportStep } from '@erxes/ui/src/components/step';
import ConfigsForm from './ConfigsForm';
import React from 'react';
import TypeForm from '../containers/TypeForm';
import Wrapper from 'modules/layout/components/Wrapper';
import { __ } from 'modules/common/utils';
import { FlexPad } from 'modules/common/components/step/styles';
import { Description, SubHeading } from '@erxes/ui-settings/src/styles';
import { loadDynamicComponent } from 'modules/common/utils';
import { IExportHistoryContentType } from '../../types';

type Props = {
  contentType: string;
  columns: any[]; //check
  count: string;
  loading: boolean;
  previewCount: (segmentId?: string) => void;
};

type State = {
  searchValue: string;
  columnWithChosenField: any;
  segmentId: string;
  columns: any[];
  contentTypes: IExportHistoryContentType[];
  type: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      segmentId: '',
      columnWithChosenField: {},
      contentTypes: [],
      columns: props.columns,
      searchValue: '',
      type: 'single'
    };
  }

  onChangeColumn = (column, value, contentType) => {
    const { columnWithChosenField } = this.state;

    const temp = columnWithChosenField[contentType] || {};

    temp[column] = {};
    temp[column].value = value;

    const temp2 = columnWithChosenField || {};

    temp2[contentType] = temp;

    this.setState({ columnWithChosenField: temp2 });
  };

  onChangeContentType = (contentType: IExportHistoryContentType) => {
    const { type, contentTypes } = this.state;

    if (type === 'single') {
      return this.setState({ contentTypes: [contentType] });
    }

    let temp: IExportHistoryContentType[] = [];

    if (contentTypes.length === 2) {
      temp = [...contentTypes];

      temp[0] = contentTypes[1];

      temp[1] = contentType;

      return this.setState({ contentTypes: temp });
    }

    temp = [...contentTypes];

    temp.push(contentType);

    return this.setState({ contentTypes: temp });
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
  addFilter = segmentId => {
    this.setState({ segmentId });

    this.props.previewCount(segmentId);
  };

  onSearch = e => {
    const value = e.target.value;

    this.setState({ searchValue: value });
  };
  segmentCloseModal = () => {
    this.setState({ segmentId: '' });

    this.props.previewCount();
  };

  render() {
    const { columns, searchValue, segmentId, contentTypes } = this.state;

    const { contentType } = this.props;
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
                contentTypes={contentTypes}
              />
            </Step>
            {
              <Step title="Content">
                <ConfigsForm
                  columns={columns}
                  onClickField={this.onClickField}
                  onSearch={this.onSearch}
                  searchValue={searchValue}
                />
              </Step>
            }
            <ExportStep title="Filter">
              <FlexPad direction="column" overflow="auto">
                <SubHeading>{__('Filter')}</SubHeading>
                <Description>
                  {__('Skip this step if you wish to export all items')}
                </Description>
                {loadDynamicComponent('importExportFilterForm', {
                  ...this.props,
                  id: segmentId,
                  contentType: contentType || 'customer',
                  closeModal: this.segmentCloseModal,
                  addFilter: this.addFilter,
                  hideDetailForm: true,
                  usageType: 'export'
                })}
              </FlexPad>
            </ExportStep>
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

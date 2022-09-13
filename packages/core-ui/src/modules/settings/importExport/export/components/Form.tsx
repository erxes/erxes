import { Content, LeftContent } from '../../styles';
import { Step, Steps } from '@erxes/ui/src/components/step';
import ConfigsForm from './ConfigsForm';
import React from 'react';
import TypeForm from '../containers/TypeForm';
import Wrapper from 'modules/layout/components/Wrapper';
import { __ } from 'modules/common/utils';
import { FlexPad } from 'modules/common/components/step/styles';
import { Description, SubHeading } from '@erxes/ui-settings/src/styles';
import { loadDynamicComponent } from 'modules/common/utils';

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
  importName: string;
  disclaimer: boolean;
  type: string;
  contentType: string;
  segmentId: string;

  associatedField: string;
  associatedContentType: string;
  columns: any[];
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      segmentId: '',
      columnWithChosenField: {},
      importName: '',
      disclaimer: false,
      type: 'single',
      contentType: '',
      associatedField: '',
      associatedContentType: '',
      columns: props.columns,
      searchValue: ''
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

  onChangeImportName = value => {
    this.setState({ importName: value });
  };

  onChangeDisclaimer = value => {
    this.setState({ disclaimer: value });
  };

  onChangeType = value => {
    this.setState({ type: value, contentType: '' });
  };

  onChangeContentType = () => {
    const { contentType } = this.state;

    return this.setState({ contentType });
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
    const { type, columns, searchValue, segmentId } = this.state;

    const { contentType } = this.props;
    const title = __('Import');

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import & Export'), link: '/settings/importHistories' },
      { title }
    ];
    console.log(segmentId, '<=============segmentId');
    console.log(contentType, '<=============contentType');
    console.log(this.segmentCloseModal, '<=============closeModal');
    console.log(this.addFilter, '<=============addFilter');

    const content = (
      <Content>
        <LeftContent>
          <Steps active={1} direction="horizontal">
            <Step title="Type" link="exportHistories">
              <TypeForm
                type={type}
                onChangeContentType={this.onChangeContentType}
                contentType={contentType}
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
            <Step title="Filter">
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

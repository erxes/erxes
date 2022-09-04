import { Content, LeftContent } from '../../styles';
import { Step, Steps } from '@erxes/ui/src/components/step';

import AccociateForm from '../containers/AccociateForm';
import ConfigsForm from './ConfigsForm';
import { IImportHistoryContentType } from '../../types';
import React from 'react';
import TypeForm from '../containers/TypeForm';
import Wrapper from 'modules/layout/components/Wrapper';
import { __ } from 'modules/common/utils';

type Props = {
  contentType: string;
  columns: any[];
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
  contentTypes: IImportHistoryContentType[];
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
      contentTypes: [],
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
    this.setState({ type: value, contentTypes: [] });
  };

  onChangeAssociateHeader = value => {
    this.setState({ associatedField: value });
  };

  onChangeAssociateContentType = value => {
    this.setState({ associatedContentType: value });
  };

  onChangeContentType = (contentType: IImportHistoryContentType) => {
    const { type, contentTypes } = this.state;

    if (type === 'single') {
      return this.setState({ contentTypes: [contentType] });
    }

    let temp: IImportHistoryContentType[] = [];

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

  renderAssociateForm = () => {
    if (this.state.type === 'multi') {
      const { contentTypes } = this.state;
      const attachmentNames: string[] = [];

      return (
        <Step title="Accociate">
          <AccociateForm
            attachmentNames={attachmentNames}
            contentTypes={contentTypes}
            onChangeAssociateHeader={this.onChangeAssociateHeader}
            onChangeAssociateContentType={this.onChangeAssociateContentType}
          />
        </Step>
      );
    }

    return;
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
  onSearch = e => {
    const value = e.target.value;

    this.setState({ searchValue: value });
  };

  // renderExportButton = () => {
  //   const { currentType } = this.props;

  //   if (currentType)
  //     return (
  //       <Link to={`/settings/export?type=${currentType}`}>
  //         <Button icon="export" btnStyle="primary">
  //           {__(`Export ${this.getButtonText()}`)}
  //         </Button>
  //       </Link>
  //     );

  //   return (
  //     <Button icon="export" btnStyle="primary" disabled>
  //       {__('Export')}
  //     </Button>
  //   );
  // };
  render() {
    const { type, contentTypes, columns, searchValue } = this.state;

    console.log('columns:::::::::::', this.props.columns);

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
                type={type}
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
            <Step title="Filter">
              {/* <ConfigsForm
                  columns={columns}
                  onClickField={this.onClickField}
                  onSearch={this.onSearch}
                  searchValue={searchValue}
                /> */}
            </Step>
          </Steps>
        </LeftContent>
      </Content>
    );

    console.log(columns, 'columns:::::::');

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

import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import SortableList from 'modules/common/components/SortableList';
import { colors } from 'modules/common/styles';
import { ScrollWrapper } from 'modules/common/styles/main';
import { __, getEnv } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import { IConfigColumn } from '../types';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  background: ${colors.bgActive};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  margin-bottom: 10px;

  > span {
    text-transform: uppercase;
    padding: 5px 20px 5px 30px;
    font-weight: bold;
  }
`;

const Footer = styled.div`
  text-align: right;
  margin-top: 20px;
`;

const Child = styled.div`
  width: 100%;
  label {
    float: right;
  }
`;

type Props = {
  columns: IConfigColumn[];
  save: (columnsConfig: IConfigColumn[], importType?: string) => void;
  closeModal: () => void;
  contentType: string;
  type: string;
};

type State = {
  columns: IConfigColumn[];
  importType: string;
};

class ManageColumns extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { columns: props.columns, importType: 'csv' };
  }

  onSubmit = e => {
    e.preventDefault();
    const columnsConfig: IConfigColumn[] = [];
    const { importType } = this.state;

    this.state.columns.forEach((col, index) => {
      const element = document.getElementById(col._id) as HTMLInputElement;

      columnsConfig.push({
        _id: col._id,
        order: index,
        checked: element.checked,
        name: col.name,
        label: col.label
      });
    });

    this.props.save(columnsConfig, importType);
    this.props.closeModal();
  };

  onChangeColumns = columns => {
    this.setState({ columns });
  };

  render() {
    const { REACT_APP_API_URL } = getEnv();
    const { type, contentType } = this.props;

    const child = col => {
      return (
        <Child>
          <span>{col.label}</span>
          <FormControl
            id={String(col._id)}
            defaultChecked={col.checked}
            componentClass="checkbox"
          />
        </Child>
      );
    };

    const onclickCsv = e => {
      this.setState({ importType: 'csv' }, () => {
        this.onSubmit(e);
      });
    };

    const exportData = () => {
      window.open(
        `${REACT_APP_API_URL}/file-export?type=${contentType}`,
        '_blank'
      );
    };

    return (
      <form onSubmit={this.onSubmit}>
        <Header>
          <span>{__('Column name')}</span>
          <span>{__('Visible')}</span>
        </Header>
        <ScrollWrapper calcHeight="320">
          <SortableList
            fields={this.state.columns}
            child={child}
            onChangeFields={this.onChangeColumns}
            isModal={true}
          />
        </ScrollWrapper>
        <Footer>
          <Button
            type="button"
            btnStyle="simple"
            onClick={this.props.closeModal}
            uppercase={false}
          >
            Cancel
          </Button>

          {type && type === 'import' ? (
            <Button uppercase={false} type="submit" onClick={onclickCsv}>
              Download csv
            </Button>
          ) : null}

          {type && type === 'export' ? (
            <Button uppercase={false} type="submit" onClick={exportData}>
              Export {contentType}
            </Button>
          ) : null}

          {!['export', 'import'].includes(type) ? (
            <Button uppercase={false} type="submit" onClick={this.onSubmit}>
              Save
            </Button>
          ) : null}
        </Footer>
      </form>
    );
  }
}

export default ManageColumns;

import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import SortableList from 'modules/common/components/SortableList';
import { colors } from 'modules/common/styles';
import { ScrollWrapper } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import { FieldsCombinedByType, IConfigColumn } from '../types';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  background: ${colors.bgActive};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  margin-bottom: 5px;

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
  fields: FieldsCombinedByType[];
  config: IConfigColumn[];
  save: (columnsConfig: IConfigColumn[]) => void;
  closeModal: () => void;
};

type State = {
  fields: FieldsCombinedByType[];
};

class ManageColumns extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      fields: props.fields
    };
  }

  onSubmit = e => {
    e.preventDefault();
    const columnsConfig: IConfigColumn[] = [];

    this.state.fields.forEach((field, index) => {
      const element = document.getElementById(field._id) as HTMLInputElement;

      if (element.checked) {
        columnsConfig.push({
          order: index,
          name: field.name,
          label: field.label
        });
      }
    });

    this.props.save(columnsConfig);
    this.props.closeModal();
  };

  onChangeFields = fields => {
    this.setState({ fields });
  };

  render() {
    const { config: configArr } = this.props;

    const configMap = {};

    configArr.forEach(config => {
      configMap[config.name] = true;
    });

    const child = field => {
      return (
        <Child>
          <span>{field.label}</span>
          <FormControl
            id={String(field._id)}
            defaultChecked={configMap[field.name]}
            componentClass="checkbox"
          />
        </Child>
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
            fields={this.state.fields}
            child={child}
            onChangeFields={this.onChangeFields}
            isModal={true}
          />
        </ScrollWrapper>
        <Footer>
          <Button
            type="button"
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button type="submit" btnStyle="success" icon="checked-1">
            Submit
          </Button>
        </Footer>
      </form>
    );
  }
}

export default ManageColumns;

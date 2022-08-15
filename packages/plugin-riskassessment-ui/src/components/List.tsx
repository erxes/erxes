import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { ICommonListProps } from '../common/types';
import Form from './Form';
import { Button, FormControl, ModalTrigger, Table, Wrapper } from '@erxes/ui/src';
import TableRow from './Row';
import _loadash from 'lodash';
import { DefaultWrapper } from '../common/utils';

type Props = {
  queryParams: any;
  history: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  list: object[];
  totalCount: number;
} & ICommonListProps;

type IState = {
  selectedValue: string[];
};

class ListComp extends React.Component<Props, IState> {
  constructor(props) {
    super(props);

    this.state = {
      selectedValue: [],
    };
    this.selectValue = this.selectValue.bind(this);
  }

  generateDoc = (values) => {
    return { ...values };
  };

  selectValue(id: string) {
    const { selectedValue } = this.state;
    if (selectedValue.includes(id)) {
      const newSelectedValue = selectedValue.filter((p) => p !== id);
      return this.setState({ selectedValue: newSelectedValue });
    }
    this.setState({ selectedValue: [...selectedValue, id] });
  }

  selectAllValue(items) {
    if (
      _loadash.isEqual(
        items.map((object) => object._id),
        this.state.selectedValue
      )
    ) {
      return this.setState({ selectedValue: [] });
    }
    const ids = items.map((item) => item._id);
    this.setState({ selectedValue: ids });
  }

  renderForm = (props) => {
    return (
      <Form {...props} renderButton={this.props.renderButton} generateDoc={this.generateDoc} />
    );
  };

  renderFormContent = (props) => {
    const save = this.props.save;
    return this.renderForm({ ...props, save });
  };

  rightActionBarTrigger = (
    <Button btnStyle="success" icon="plus-circle">
      Add Risk Assessment
    </Button>
  );

  rightActionBar = (
    <ModalTrigger
      title="Add Risk Assessment"
      size="lg"
      enforceFocus={false}
      trigger={this.rightActionBarTrigger}
      autoOpenKey="showListFormModal"
      content={this.renderFormContent}
      dialogClassName="transform"
    />
  );
  handleRemoveBtn = () => {
    const { remove } = this.props;
    const { selectedValue } = this.state;
    remove(selectedValue);
  };
  RemoveBtn = (
    <Button btnStyle="danger" icon="cancel-1" onClick={this.handleRemoveBtn}>
      Remove
    </Button>
  );

  renderContent = (list) => {
    const { selectedValue } = this.state;
    return (
      <Table>
        <thead>
          <tr>
            <th>
              {list && (
                <FormControl
                  componentClass="checkbox"
                  checked={_loadash.isEqual(
                    selectedValue,
                    list.map((object) => object._id)
                  )}
                  onChange={() => this.selectAllValue(list)}
                />
              )}
            </th>
            <th>Name</th>
            <th>categoryId</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {list?.map((item, i) => {
            return (
              <TableRow
                key={i}
                object={item}
                selectedValue={selectedValue}
                onchange={this.selectValue}
                renderButton={this.props.renderButton}
              />
            );
          })}
        </tbody>
      </Table>
    );
  };

  render() {
    const { list } = this.props;
    const { selectedValue } = this.state;

    const rightActionBar = (
      <>
        {selectedValue.length > 0 && this.RemoveBtn}
        {this.rightActionBar}
      </>
    );

    const updatedProps = {
      ...this.props,
      title: 'Assessment List',
      rightActionBar: rightActionBar,
      content: this.renderContent(list),
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default ListComp;

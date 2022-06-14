import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import List from '@erxes/ui-settings/src/common/components/List';
import { ICommonListProps } from '@erxes/ui-settings/src/common/types';
import Form from './Form';

type Props = {
  queryParams: any;
  history: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
} & ICommonListProps;

class ListComp extends React.Component<Props> {
  renderForm = props => {
    return <Form {...props} renderButton={this.props.renderButton} />;
  };

  renderRow({ objects }) {
    return objects.map((object, index) => (
      <tr key={index}>
        <h5>{object.name}</h5>
      </tr>
    ));
  }

  renderContent = props => {
    return (
      <table>
        <tr>
          <td>Name</td>
        </tr>
        <tbody>{this.renderRow(props)}</tbody>
      </table>
    );
  };

  render() {
    return (
      <List
        formTitle="New"
        size="lg"
        title={__('List')}
        renderForm={this.renderForm}
        renderContent={this.renderContent}
        {...this.props}
        queryParams={this.props.queryParams}
        history={this.props.history}
      />
    );
  }
}

export default ListComp;

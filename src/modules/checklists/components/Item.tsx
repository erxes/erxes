import { TitleRow } from 'modules/boards/styles/item';
import { FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import { IChecklistItem } from '../types';

type Props = {
  item: IChecklistItem;
  removeItem: (checklistItemId: string) => void;
};

type State = {
  isEditing: boolean;
  content: string;
};

class Checklists extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      content: props.item.content
    };
  }

  renderInput() {
    const { isEditing, content } = this.state;

    if (!isEditing) {
      return null;
    }

    return <input value={content} />;
  }

  onLabelClick = () => {
    this.setState({ isEditing: true });
  };

  render = () => {
    const { removeItem, item } = this.props;
    const { content } = this.state;

    const onClick = () => removeItem(item._id);

    return (
      <TitleRow>
        <FormControl
          componentClass="checkbox"
          checked={item.isChecked}
          value="{item.content}"
          placeholder={content}
        />
        <label onClick={this.onLabelClick}>{content}</label>
        {this.renderInput()}

        <button onClick={onClick}>
          <Icon icon="times-circle" />
        </button>
      </TitleRow>
    );
  };
}

export default Checklists;

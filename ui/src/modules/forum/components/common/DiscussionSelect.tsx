import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { selectOptions } from '../../utils';
import { router } from 'modules/common/utils';
import { IForum, ITopic, IDiscussion } from '../../types';

export const FormContainer = styled.div`
  padding-right: 20px;
`;

type Props = {
  forums: IForum[];
  topics: ITopic[];
  discussions: IDiscussion[];
  callback?: () => void;
  onChangeConnection: (discussionId: string) => void;
  queryParams: any;
  history: any;
};

type State = {
  discussionId: string;
};

class ForumSelect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      discussionId: ''
    };
  }

  renderOptions = option => {
    return (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );
  };

  renderSelect(placeholder, value, onChange, options) {
    return (
      <Select
        isRequired={true}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        optionRenderer={this.renderOptions}
        options={options}
        clearable={false}
      />
    );
  }

  onChangeForum = value => {
    this.props.onChangeConnection('');
    router.removeParams(this.props.history, 'topicId');
    router.setParams(this.props.history, { forumId: value });
  };

  onChangeTopic = value => {
    router.setParams(this.props.history, { topicId: value });
  };

  renderContent() {
    const {
      forums,
      topics,
      discussions,
      onChangeConnection,
      queryParams
    } = this.props;

    return (
      <>
        <FormGroup>
          <ControlLabel>Forum</ControlLabel>
          {this.renderSelect(
            'Choose forum',
            queryParams.forumId,
            frm => this.onChangeForum(frm.value),
            selectOptions(forums)
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Topic</ControlLabel>
          {this.renderSelect(
            'Choose topic',
            queryParams.topicId,
            tpc => this.onChangeTopic(tpc.value),
            selectOptions(topics)
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Discussion</ControlLabel>
          {this.renderSelect(
            'Choose discussion',
            this.state.discussionId,
            dis => onChangeConnection(dis.value),
            selectOptions(discussions)
          )}
        </FormGroup>
      </>
    );
  }

  render() {
    return <FormContainer>{this.renderContent()}</FormContainer>;
  }
}

export default ForumSelect;

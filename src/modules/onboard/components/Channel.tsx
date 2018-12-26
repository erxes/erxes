import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { IChannel } from 'modules/settings/channels/types';
import * as React from 'react';
import Select from 'react-select-plus';
import { Footer, ScrollContent, TopContent } from './styles';

type Props = {
  members: IUser[];
  channelsTotalCount: number;
  loading: boolean;
  remove: (channelId: string) => void;
  save: (
    params: {
      doc: {
        name: string;
        memberIds: string[];
      };
    },
    channel?: IChannel
  ) => void;
};

type State = {
  selectedMembers: IUser[];
};

class ChannelForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMembers: this.generateMembersParams(props.members)
    };
  }

  save = e => {
    e.preventDefault();

    const { save } = this.props;

    save(this.generateDoc());
  };

  collectValues = items => {
    return items.map(item => item.value);
  };

  generateMembersParams = members => {
    return members.map(member => ({
      value: member._id,
      label: (member.details && member.details.fullName) || ''
    }));
  };

  generateDoc = () => {
    return {
      doc: {
        name: (document.getElementById('channel-name') as HTMLInputElement)
          .value,
        memberIds: this.collectValues(this.state.selectedMembers)
      }
    };
  };

  renderContent() {
    const { members } = this.props;

    const object = { name: '', description: '' };
    const self = this;

    const onChange = items => {
      self.setState({ selectedMembers: items });
    };

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="channel-name"
            defaultValue={object.name}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Members</ControlLabel>

          <Select
            placeholder={__('Choose members')}
            onChange={onChange}
            value={self.state.selectedMembers}
            options={self.generateMembersParams(members)}
            multi={true}
          />
        </FormGroup>
      </React.Fragment>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        <ScrollContent>
          <TopContent>
            <img src="/images/icons/erxes-05.svg" />
            <h2>Create your channel</h2>
          </TopContent>
          {this.renderContent()}
        </ScrollContent>
        <Footer>
          <Button btnStyle="link">Back</Button>
          <Button btnStyle="primary" type="submit">
            Next <Icon icon="rightarrow" />
          </Button>
        </Footer>
      </form>
    );
  }
}

export default ChannelForm;

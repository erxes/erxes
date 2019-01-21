import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Select from 'react-select-plus';
import { IIntegration } from '../types';
import { Footer, TopContent } from './styles';

type Props = {
  members: IUser[];
  channelsTotalCount: number;
  loading: boolean;
  integrations: IIntegration[];
  remove: (channelId: string) => void;
  save: (
    doc: {
      name: string;
      memberIds: string[];
      integrationIds: string[];
    }
  ) => void;
};

type State = {
  selectedMembers: IUser[];
  selectedMessengers: IIntegration[];
};

class ChannelForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMembers: [],
      selectedMessengers: []
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

  generateListParams = items => {
    return items.map(item => ({
      value: item._id,
      label: item.name || (item.details && item.details.fullName) || ''
    }));
  };

  generateDoc = () => {
    return {
      name: (document.getElementById('channel-name') as HTMLInputElement).value,
      memberIds: this.collectValues(this.state.selectedMembers),
      integrationIds: this.collectValues(this.state.selectedMessengers)
    };
  };

  renderContent() {
    const { members, integrations } = this.props;

    const self = this;

    const onChange = items => {
      self.setState({ selectedMembers: items });
    };

    const onChangeIntegrations = items => {
      self.setState({ selectedMessengers: items });
    };

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="channel-name" type="text" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Users</ControlLabel>

          <Select
            placeholder={__('Choose members')}
            onChange={onChange}
            value={self.state.selectedMembers}
            options={self.generateListParams(members)}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Messengers</ControlLabel>

          <Select
            placeholder={__('Choose messengers')}
            onChange={onChangeIntegrations}
            value={self.state.selectedMessengers}
            options={self.generateListParams(integrations)}
            multi={true}
          />
        </FormGroup>
      </React.Fragment>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        <TopContent>
          <h2>Create your channel</h2>
          {this.renderContent()}
        </TopContent>
        <Footer>
          <Button btnStyle="link">Previous</Button>
          <Button btnStyle="success" type="submit">
            Next <Icon icon="rightarrow" />
          </Button>
        </Footer>
      </form>
    );
  }
}

export default ChannelForm;

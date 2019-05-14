import { defaultSuggestionsFilter } from 'bat-draft-js-mention-plugin';
import { EditorState } from 'draft-js';
import gql from 'graphql-tag';
import { fromJS } from 'immutable';
import { queries } from 'modules/inbox/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../utils';

interface ITeamMembers {
  _id: string;
  name: string;
  title?: string;
  avatar?: string;
}

const MentionEntry = props => {
  const { mention, theme, searchValue, ...parentProps } = props;

  console.log('theme: ', theme); //tslint:disable-line

  return (
    <div {...parentProps}>
      <div className="mentionSuggestionsEntryContainer">
        <div className="mentionSuggestionsEntryContainerLeft">
          <img
            alt={mention.get('name')}
            role="presentation"
            src={mention.get('avatar') || '/images/avatar-colored.svg'}
            className="mentionSuggestionsEntryAvatar"
          />
        </div>

        <div className="mentionSuggestionsEntryContainerRight">
          <div className="mentionSuggestionsEntryText">
            {mention.get('name')}
          </div>

          <div className="mentionSuggestionsEntryTitle">
            {mention.get('title')}
          </div>
        </div>
      </div>
    </div>
  );
};

const extractEntries = mention => {
  const entries = mention._root.entries;

  return entries.reduce(
    (result, [key, val]) => ({ ...result, [key]: val }),
    {}
  );
};

type Props = {
  onChange: (editorState: EditorState) => void;
  onAddMention: (collectedUsers: any[]) => void;
  plugin: any;
};

type FinalProps = {
  mentions: any;
} & Props;

type State = {
  collectedUsers: any;
  suggestions: any;
};

class Mention extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      collectedUsers: [],
      suggestions: this.props.mentions.toArray()
    };
  }

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(
        value,
        this.props.mentions.toArray()
      )
    });
  };

  onAddMention = object => {
    const mention = extractEntries(object);

    const collectedUsers = this.state.collectedUsers;

    collectedUsers.push(mention);

    // wait to update editorState
    setTimeout(() => {
      // send mentioned user to parent
      this.props.onAddMention(collectedUsers);
    }, 300);
  };

  render() {
    const { MentionSuggestions } = this.props.plugin;

    return (
      <MentionSuggestions
        onSearchChange={this.onSearchChange}
        suggestions={this.state.suggestions}
        entryComponent={MentionEntry}
        onAddMention={this.onAddMention}
      />
    );
  }
}

type UserProps = {
  usersQuery: UsersQueryResponse;
} & Props;

const MentionContainer = (props: UserProps) => {
  const { usersQuery } = props;

  const teamMembers: ITeamMembers[] = [];

  for (const user of usersQuery.users || []) {
    teamMembers.push({
      _id: user._id,
      name: user.username,
      title: user.details && user.details.position,
      avatar: user.details && user.details.avatar
    });
  }

  const extendedProps = {
    mentions: fromJS(teamMembers.filter(member => member.name)),
    ...props
  };

  return <Mention {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, UsersQueryResponse>(gql(queries.userList), {
      name: 'usersQuery'
    })
  )(MentionContainer)
);

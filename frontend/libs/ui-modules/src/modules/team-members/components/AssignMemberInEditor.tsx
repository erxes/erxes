import {
  DefaultReactSuggestionItem,
  SuggestionMenuController,
  SuggestionMenuProps,
} from '@blocknote/react';
import { IBlockEditor, SuggestionMenu, SuggestionMenuItem } from 'erxes-ui';
import { IUser } from '../types/TeamMembers';
import { useApolloClient } from '@apollo/client';
import { MembersInline } from './MembersInline';
import { GET_USERS } from '../graphql/queries/userQueries';

type UserSuggestionItem = DefaultReactSuggestionItem & {
  user?: IUser;
  isPlaceholder?: boolean;
};

export const AssignMemberInEditor = ({ editor }: { editor: IBlockEditor }) => {
  const client = useApolloClient();

  return (
    <SuggestionMenuController
      triggerCharacter="@"
      suggestionMenuComponent={(props: SuggestionMenuProps<any>) => (
        <MentionMenu {...props} />
      )}
      onItemClick={(item: any) => {
        if (item.onItemClick) {
          item.onItemClick();
        }
      }}
      getItems={async (query) => {
        try {
          const { data } = await client.query({
            query: GET_USERS,
            variables: {
              searchValue: query,
              limit: 20,
            },
          });

          const list = data?.users?.list || [];

          if (list.length === 0) {
            return [
              {
                title: 'No results found',
                isPlaceholder: true,
              },
            ];
          }

          return list.map(({ details, ...restUser }: IUser) => {
            return {
              title: details?.fullName || 'Unknown',
              user: { ...restUser, details: details || {} } as IUser,
              onItemClick: () => {
                editor.suggestionMenus.clearQuery();
                editor.suggestionMenus.closeMenu();

                editor.insertInlineContent([
                  {
                    type: 'mention',
                    props: {
                      fullName: details?.fullName || 'Unknown',
                      _id: restUser._id,
                    },
                  },
                  ' ',
                ]);
              },
            };
          });
        } catch (error) {
          console.error(error);
          return [
            {
              title: 'Error loading users',
              isPlaceholder: true,
            },
          ];
        }
      }}
    />
  );
};

export function MentionMenu(props: SuggestionMenuProps<any>) {
  const { items, selectedIndex } = props;

  const userItems = items as UserSuggestionItem[];

  return (
    <SuggestionMenu>
      {userItems.map((item, index) => {
        if (item.isPlaceholder) {
          return (
            <div
              key="no-results"
              className="p-2 text-gray-500 italic cursor-default"
            >
              {item.title}
            </div>
          );
        }

        return (
          <MentionMenuItem
            key={index}
            onClick={item.onItemClick}
            text={item.title}
            isSelected={selectedIndex === index}
            index={index}
            user={item.user}
          />
        );
      })}
    </SuggestionMenu>
  );
}

interface MentionMenuItemProps {
  onClick: () => void;
  isSelected: boolean;
  index: number;
  text: string;
  user?: IUser;
}

function MentionMenuItem({ onClick, isSelected, user }: MentionMenuItemProps) {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    event.preventDefault();
    event.stopPropagation();
    onClick();
  };

  return (
    <SuggestionMenuItem
      onClick={handleClick}
      className="justify-start"
      isSelected={isSelected}
    >
      {!!user && <MembersInline members={[user]} />}
    </SuggestionMenuItem>
  );
}

import { IUser } from "@erxes/ui/src/auth/types";
import { __ } from "@erxes/ui/src/utils/core";
import Participators from "@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/Participators";
import React from "react";
import Popover from "@erxes/ui/src/components/Popover";
import { VotersContent, VotersCount } from "../../styles";
import { PopoverContent } from "@erxes/ui/src/components/filterableList/styles";

type Props = {
  count: number;
  users: IUser[];
};

class Votes extends React.Component<Props> {
  render() {
    const { count } = this.props;

    return (
      <Popover
        trigger={
          <VotersCount>
            {count} vote{count > 1 && "s"}
          </VotersCount>
        }
        placement="bottom-start"
      >
        <h3>{__("Voters")}</h3>
        <PopoverContent>
          <VotersContent>
            <Participators participatedUsers={this.props.users} limit={49} />
          </VotersContent>
        </PopoverContent>
      </Popover>
    );
  }
}

export default Votes;

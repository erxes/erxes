import { CommandBar } from 'erxes-ui';

type Props = {
  selected?: string[] | undefined;
};

export const ChannelsCommandBar = ({ selected }: Props) => {
  return (
    <CommandBar open={selected?.length ? true : false}>
      <CommandBar.Bar>
        <CommandBar.Value>{selected?.length} selected</CommandBar.Value>
      </CommandBar.Bar>
    </CommandBar>
  );
};

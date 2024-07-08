import React from 'react';
import { Icon, Table } from '@erxes/ui/src';
import Popover from '@erxes/ui/src/components/Popover';
import { ControlButton } from 'reactflow';
import { PopoverContent } from '@erxes/ui/src/components/filterableList/styles';

const infos = [
  { description: 'Select Node', shortcut: 'Mouse 1' },
  { description: 'Select Multiple Nodes', shortcut: 'Ctrl + Mouse 1' },
  { description: 'Copy Selected Actions', shortcut: 'Ctrl + C' },
  { description: 'Paste Selected Actions', shortcut: 'Ctrl + P' },
  { description: 'Save Automation', shortcut: 'Ctrl + Shift + S' }
];

export default function Info() {
  return (
    <Popover
      trigger={
        <ControlButton>
          <Icon icon="question-circle" />
        </ControlButton>
      }
    >
      <PopoverContent style={{ width: '350px' }}>
        <Table>
          <tbody>
            {infos.map(({ description, shortcut }) => (
              <tr>
                <td>{description}</td>
                <td>{shortcut}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </PopoverContent>
    </Popover>
  );
}

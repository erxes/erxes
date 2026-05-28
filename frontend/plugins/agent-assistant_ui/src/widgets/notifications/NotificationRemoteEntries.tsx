import { Card, CardContent, CardHeader, CardTitle } from 'erxes-ui';
import { IconRobot } from '@tabler/icons-react';

export const NotificationRemoteEntries = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconRobot size={20} />
          Agent Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          The Agent Assistant plugin is now active! Configure AI agents in
          Settings to enable intelligent automation across your workspace.
        </p>
      </CardContent>
    </Card>
  );
};

export default NotificationRemoteEntries;

import React from 'react';
import { IconKey } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router';
import { PageHeader, PageHeaderStart } from 'ui-modules';
import { SettingsPath } from '@/types/paths/SettingsPath';

export const ChangePasswordHeader = () => {
  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={SettingsPath.ChangePassword} aria-current="page">
                  <IconKey />
                  Change password
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
    </PageHeader>
  );
};

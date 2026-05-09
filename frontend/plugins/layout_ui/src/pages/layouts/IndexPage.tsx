import {
  IconLayoutDashboard,
  IconLayoutGrid,
  IconStack2,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { PageShell } from '@/shell/PageShell';
import { Heading } from '@/atoms/Heading';
import { Text } from '@/atoms/Text';
import { StatGroup } from '@/organisms/StatGroup';
import { ContentSection } from '@/organisms/ContentSection';

export const IndexPage = () => {
  return (
    <PageShell title="Layout">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <Heading level={1}>Layout plugin</Heading>
          <Text variant="muted">
            Atomic-design components composed via a config-driven, draggable
            grid.
          </Text>
        </div>

        <div className="col-span-12">
          <StatGroup
            columns={3}
            stats={[
              {
                label: 'Atoms',
                value: 7,
                hint: 'Box, Text, Heading, Image, Button, Spacer, Divider',
                icon: IconStack2,
              },
              {
                label: 'Molecules',
                value: 4,
                hint: 'StatCard, IconButton, BreadcrumbBar, KeyValueRow',
                icon: IconLayoutGrid,
              },
              {
                label: 'Organisms',
                value: 5,
                hint: 'Header, Footer, Sidebar, StatGroup, ContentSection',
                icon: IconLayoutDashboard,
              },
            ]}
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <ContentSection
            title="Dashboard demo"
            description="Drag and resize tiles in a 12-column responsive grid."
          >
            <Button asChild>
              <Link to="/layout/dashboards/demo">Open dashboard</Link>
            </Button>
          </ContentSection>
        </div>

        <div className="col-span-12 md:col-span-6">
          <ContentSection
            title="Static page demo"
            description="Same renderer, drag/resize disabled — read-only layout."
          >
            <Button asChild variant="outline">
              <Link to="/layout/pages/sample">Open page</Link>
            </Button>
          </ContentSection>
        </div>
      </div>
    </PageShell>
  );
};

import type { Meta, StoryObj } from '@storybook/react';
import { Card } from 'erxes-ui/components/card';
import { Button } from 'erxes-ui/components/button';
import { Label } from '../label';
import { Input } from '../input';
import { Select } from '../select';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <Card.Header>
        <Card.Title>Create project</Card.Title>
        <Card.Description>
          Deploy your new project in one-click.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Framework</Label>
              <Select>
                <Select.Trigger id="framework">
                  <Select.Value placeholder="Select" />
                </Select.Trigger>
                <Select.Content position="popper">
                  <Select.Item value="next">Next.js</Select.Item>
                  <Select.Item value="sveltekit">SvelteKit</Select.Item>
                  <Select.Item value="astro">Astro</Select.Item>
                  <Select.Item value="nuxt">Nuxt.js</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>
        </form>
      </Card.Content>
      <Card.Footer className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </Card.Footer>
    </Card>
  ),
};

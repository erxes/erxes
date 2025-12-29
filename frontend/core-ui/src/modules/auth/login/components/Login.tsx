import { Tabs, ToggleGroup } from 'erxes-ui';
import { CredentialLoginForm } from '@/auth/login/components/CredentialLoginForm';
import { MagicLinkLoginForm } from '@/auth/login/components/MagicLinkLoginForm';
import { useState } from 'react';
import { useVersion } from 'ui-modules';
export const Login = () => {
  const isOS = useVersion();
  const [value, setValue] = useState<string>(
    isOS ? 'credential' : 'magic-link',
  );

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="font-semibold text-xl leading-none">Welcome</div>
        <div className="text-center text-accent-foreground">
          Please sign in to your account to continue
        </div>
      </div>

      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(value) => setValue(value as string)}
        className="w-full grid grid-cols-2 p-1 rounded-lg gap-1"
        variant="outline"
      >
        <ToggleGroup.Item
          value="magic-link"
          className="data-[state=on]:text-primary"
        >
          Magic link
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="credential"
          className="data-[state=on]:text-primary"
        >
          Email & password
        </ToggleGroup.Item>
      </ToggleGroup>

      <Tabs
        defaultValue="credential"
        value={value}
        className="flex flex-col h-full shadow-none"
      >
        <Tabs.Content value="magic-link" className="h-full">
          <MagicLinkLoginForm />
        </Tabs.Content>
        <Tabs.Content
          value="credential"
          className="h-full shadow-none border-none rounded-none"
        >
          <CredentialLoginForm />
        </Tabs.Content>
      </Tabs>
    </>
  );
};

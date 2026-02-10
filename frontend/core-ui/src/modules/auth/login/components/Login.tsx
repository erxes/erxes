import { Tabs } from 'erxes-ui';
import { CredentialLoginForm } from '@/auth/login/components/CredentialLoginForm';
import { MagicLinkLoginForm } from '@/auth/login/components/MagicLinkLoginForm';
import { useState } from 'react';
import { useVersion } from 'ui-modules';
import { motion } from 'motion/react';
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

      <Tabs
        value={value}
        onValueChange={(value) => setValue(value as string)}
        className="flex flex-col h-full shadow-none"
      >
        <Tabs.List className="bg-foreground/5 rounded-lg border-none p-1 relative w-full grid grid-cols-2 gap-1 mb-4">
          <Tabs.Trigger
            className="font-normal after:content-none after:border-none after:shadow-none text-muted-foreground data-[state=active]:text-primary hover:bg-transparent rounded-md transition-colors cursor-pointer relative z-10"
            value="magic-link"
          >
            {value === 'magic-link' && (
              <motion.div
                layoutId="activeLoginTab"
                className="absolute inset-0 bg-background shadow-sm rounded-md"
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                }}
              />
            )}
            <span className="relative z-10">Magic link</span>
          </Tabs.Trigger>
          <Tabs.Trigger
            className="font-normal after:content-none after:border-none after:shadow-none text-muted-foreground data-[state=active]:text-primary hover:bg-transparent rounded-md transition-colors cursor-pointer relative z-10"
            value="credential"
          >
            {value === 'credential' && (
              <motion.div
                layoutId="activeLoginTab"
                className="absolute inset-0 bg-background shadow-sm rounded-md"
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                }}
              />
            )}
            <span className="relative z-10">Email & password</span>
          </Tabs.Trigger>
        </Tabs.List>
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

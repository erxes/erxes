import { motion } from 'framer-motion';
import { Button, Card, PageContainer } from 'erxes-ui';
import { IconSun, IconKeyboard } from '@tabler/icons-react';
import { PageHeader } from 'ui-modules';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => (
  <div className="flex items-start space-x-3">
    <div className="mt-1 rounded-lg bg-primary/10 p-2">{icon}</div>
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export const OnBoarding = () => {
  const features: FeatureProps[] = [
    {
      icon: <IconSun className="h-4 w-4" />,
      title: 'Revamped UI',
      description:
        'Built with ShadCN and Radix UI, delivering a smoother, more accessible interface.',
    },
    {
      icon: <IconKeyboard className="h-4 w-4" />,
      title: 'Keyboard Shortcuts',
      description: 'Navigate erxes with ease using built-in shortcuts.',
    },
    {
      icon: <IconSun className="h-4 w-4" />,
      title: 'Dark & Light Mode',
      description: 'Choose the theme that suits your preference, by default.',
    },
  ];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start />
      </PageHeader>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-4xl mx-auto">
            <Card.Header>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-2 text-center"
              >
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome to erxes 3.0 – A New Experience Begins!
                </h1>
                <p className="text-muted-foreground">
                  A Fresh Start with a New UX/UI
                </p>
              </motion.div>
            </Card.Header>
            <Card.Content className="space-y-8">
              <p className="text-center text-muted-foreground">
                We've completely redesigned erxes from the ground up, bringing a
                modern, faster, and more intuitive experience. This is just the
                beginning—the new UX/UI will continue to evolve, with more
                features and plugins rolling out daily.
              </p>

              <div className="grid gap-6 md:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <Feature {...feature} />
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center">
                  What to Expect?
                </h2>
                <p className="text-center text-muted-foreground">
                  At launch, only a few plugins will feature the new UI, but we
                  are actively working to upgrade the entire platform. Every
                  day, you'll see new improvements.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center">
                  Your Feedback Shapes erxes 3.0
                </h2>
                <p className="text-center text-muted-foreground">
                  Your input is essential! Share your thoughts and help us
                  refine this new experience.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="default"
                    onClick={() =>
                      window.open(
                        'https://discord.gg/Mqvc9kDq',
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                  >
                    Join the Community
                  </Button>
                </div>
              </div>

              <p className="text-sm text-center text-muted-foreground italic">
                We've been working tirelessly for the last a month to make this
                happen—now it's your turn to explore!
              </p>
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
};

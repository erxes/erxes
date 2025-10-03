import {
  IconBrandInstagramFilled,
  IconBrandLinkedinFilled,
  IconMailFilled,
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconArrowRight,
  IconTicket,
  IconBriefcase,
  IconMessageCircle,
  IconMessage2,
  IconMail,
} from '@tabler/icons-react';
import { WelcomeMessageBackground } from './WelcomeMessageBackground';
import { currentUserState } from 'ui-modules/states';
import { useAtomValue } from 'jotai';
import { Button, cn } from 'erxes-ui';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TSocialItem,
  TOnboardingStepItem,
  TReadOnlyTabItem,
} from 'ui-modules/modules/notifications/types/welcome';

const Socials: TSocialItem[] = [
  {
    icon: <IconMailFilled className="size-5" />,
    url: 'mailto:info@erxes.io',
  },
  {
    icon: <IconBrandInstagramFilled className="size-5" />,
    url: 'https://www.instagram.com/erxeshq/',
  },
  {
    icon: <IconBrandLinkedinFilled className="size-5" />,
    url: 'https://www.linkedin.com/company/erxes/',
  },
  {
    icon: <IconBrandGithubFilled className="size-5" />,
    url: 'https://github.com/erxes',
  },
  {
    icon: <IconBrandDiscordFilled className="size-5" />,
    url: 'https://discord.gg/qEaghUeG5C',
  },
];

export const OnboardingSteps: TOnboardingStepItem[] = [
  {
    icon: <IconMail size={24} />,
    title: 'Team inbox',
    forOwner: false,
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
    action: {
      label: 'Try it out now',
      to: '#',
    },
  },
  {
    icon: <IconTicket size={24} />,
    title: 'Ticket',
    forOwner: false,
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
    action: {
      label: 'Try it out now',
      to: '#',
    },
  },
  {
    icon: <IconBriefcase size={24} />,
    title: 'Deal',
    forOwner: false,
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
    action: {
      label: 'Try it out now',
      to: '#',
    },
  },
  {
    icon: <IconMessageCircle size={24} />,
    title: 'Business messenger',
    forOwner: false,
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
    action: {
      label: 'Try it out now',
      to: '#',
    },
  },
  {
    icon: <IconMessage2 size={24} />,
    title: 'Business messenger',
    forOwner: false,
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
    action: {
      label: 'Try it out now',
      to: '#',
    },
  },
];

const SocialSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.0 }}
  >
    <h3 className="text-base font-medium text-muted-foreground text-center mb-4">
      Contact Us:
    </h3>
    <div className="flex flex-wrap justify-center gap-2">
      {Socials.map((item) => {
        return (
          <Link to={item.url}>
            <div className="bg-muted text-muted-foreground  rounded-sm p-[6px]">
              {item.icon}
            </div>
          </Link>
        );
      })}
    </div>
  </motion.div>
);

const OnboardingStepsSection = ({
  isOwner,
  onboardingSteps,
}: {
  isOwner: boolean;
  onboardingSteps: TOnboardingStepItem[];
}) => {
  const filteredSteps = onboardingSteps.filter(
    (item) => !item.forOwner || isOwner,
  );

  const renderCard = (item: TOnboardingStepItem, index: number) => (
    <div
      key={index}
      className="border rounded-2xl p-4 flex flex-col gap-3 bg-background min-h-[200px]"
    >
      <div className="flex flex-col gap-3 flex-1">
        <div className="p-[10px] rounded-md text-primary bg-primary/10 w-min">
          {item.icon}
        </div>
        <h3 className="font-semibold text-primary text-lg break-words">
          {item.title}
        </h3>
        <p className="text-base text-muted-foreground break-words flex-1">
          {item.description}
        </p>
      </div>
      <Button asChild size="sm" variant="ghost" className="self-start mt-auto">
        <Link to={item.action.to} className="hover:bg-background">
          <span className="text-primary font-semibold text-base flex items-center gap-1 break-words">
            <span className="truncate">{item.action.label}</span>
            <IconArrowRight className="size-4 flex-shrink-0" />
          </span>
        </Link>
      </Button>
    </div>
  );

  const renderGrid = () => {
    const count = filteredSteps.length;

    if (count === 3) {
      return (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredSteps
              .slice(0, 2)
              .map((item, index) => renderCard(item, index))}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {filteredSteps
              .slice(2, 3)
              .map((item, index) => renderCard(item, index + 2))}
          </div>
        </div>
      );
    }

    if (count === 4) {
      return (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredSteps
              .slice(0, 2)
              .map((item, index) => renderCard(item, index))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredSteps
              .slice(2, 4)
              .map((item, index) => renderCard(item, index + 2))}
          </div>
        </div>
      );
    }

    if (count === 5) {
      return (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {filteredSteps
              .slice(0, 3)
              .map((item, index) => renderCard(item, index))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredSteps
              .slice(3, 5)
              .map((item, index) => renderCard(item, index + 3))}
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredSteps.map((item, index) => renderCard(item, index))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="max-w-4xl w-full items-center mx-auto"
    >
      <h2 className="text-xl font-semibold text-center mb-6">Get Started</h2>
      <div className="p-2 rounded-3xl border bg-muted">{renderGrid()}</div>
    </motion.div>
  );
};

const LazyVideo = ({ src }: { src: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video border border-foreground/10  overflow-hidden bg-foreground/10 p-3 rounded-[20px]"
    >
      {isInView && (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <video
            src={src}
            controls
            className={`w-full h-full object-cover transition-opacity duration-300 bg-background rounded-md border border-foreground/10 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadedData={() => setIsLoaded(true)}
            preload="metadata"
          />
        </>
      )}
      {!isInView && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          Video will load when visible
        </div>
      )}
    </div>
  );
};

const ReadOnlyTabs = ({ tabItems }: { tabItems: TReadOnlyTabItem[] }) => {
  return (
    <div className="cursor-default w-min   mx-auto max-w-[calc(100vw-2rem)]">
      <div className="rounded-lg border overflow-x-auto  border-foreground/10 bg-foreground/10 p-1">
        <div className="flex gap-2 ">
          {tabItems.map((item) => (
            <div
              key={item.label}
              className={cn(
                'flex items-center justify-center gap-2 font-medium text-[13px] py-2 px-2 rounded-[4px] text-center',
                item.isActive && 'bg-white text-primary shadow-sm',
              )}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const WelcomeNotificationContentLayout = ({
  title,
  description,
  tabItems,
  videoSrc,
  onboardingSteps,
}: {
  title: string;
  description: string;
  tabItems?: TReadOnlyTabItem[];
  videoSrc: string;
  onboardingSteps: TOnboardingStepItem[];
}) => {
  const currentUser = useAtomValue(currentUserState);
  return (
    <div className="container px-4 sm:px-8 md:px-20 py-12 lg:px-4 xl:px-12 relative">
      <WelcomeMessageBackground className="absolute inset-0 z-0" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl min-w-0 mx-auto space-y-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 text-center"
        >
          <h1 className="text-2xl font-semibold tracking-tight bg-clip-text text-primary">
            {title}
          </h1>
          <p className="text-base text-muted-foreground">{description}</p>
        </motion.div>
        {tabItems && <ReadOnlyTabs tabItems={tabItems} />}
        <div className="space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <LazyVideo src={videoSrc} />
          </motion.div>
          <OnboardingStepsSection
            isOwner={currentUser?.isOwner || false}
            onboardingSteps={onboardingSteps}
          />
          <SocialSection />
        </div>
      </motion.div>
    </div>
  );
};

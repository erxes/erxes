import {
  IconBrandInstagramFilled,
  IconBrandLinkedinFilled,
  IconMailFilled,
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
} from '@tabler/icons-react';
import { WelcomeMessageBackground } from './WelcomeMessageBackground';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
const COMING_SOON_VIDEO_SRC =
  'https://pub-3bcba1ff529f4ce3bf25b4e16962c239.r2.dev/intro.mp4';
const Socials = [
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
          <Link to={item.url} key={item.url}>
            <div className="bg-muted text-muted-foreground  rounded-sm p-[6px]">
              {item.icon}
            </div>
          </Link>
        );
      })}
    </div>
  </motion.div>
);

export const WelcomeNotificationFallback = ({
  pluginName,
}: {
  pluginName?: string;
}) => {
  return (
    <div className="container px-4 sm:px-8 md:px-20 py-12 lg:px-4 xl:px-12 relative h-full flex flex-col justify-center">
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
          <div className="w-full text-2xl font-semibold tracking-tight bg-clip-tex inline ">
            <h1 className="capitalize inline">
              Welcome to {pluginName || 'erxes'}{' '}
            </h1>
            <span>plugin</span>
          </div>
          <p className="text-base text-muted-foreground">
            A New experience begins!
          </p>
        </motion.div>

        <div className="space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <video
              src={COMING_SOON_VIDEO_SRC}
              className={`w-full h-full transition-opacity duration-300 bg-background rounded-xl border border-foreground/10 overflow-hidden`}
              autoPlay
            />
          </motion.div>
          <SocialSection />
        </div>
      </motion.div>
    </div>
  );
};

import {
  IconKeyboardFilled,
  IconPaintFilled,
  IconSunFilled,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { motion } from 'framer-motion';

const items = [
  {
    icon: <IconPaintFilled />,
    title: 'Revamped UI',
    description:
      'Built with ShadCN and Radix UI for a more accessible interface.',
  },
  {
    icon: <IconKeyboardFilled />,
    title: 'Keyboard Shortcuts',
    description: 'Navigate quickly using built-in shortcuts.',
  },
  {
    icon: <IconSunFilled />,
    title: 'Dark & Light Mode',
    description:
      'Switch between dark and light modes to suit your preferences.',
  },
];

const InfoList = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="p-2 rounded-3xl border bg-muted max-md:mx-8"
    >
      <div className="sm:grid flex flex-col sm:grid-cols-2 lg:grid-cols-3 gap-2 max-lg:[&>*:last-child]:col-span-2 ">
        {items.map((item, index) => (
          <InfoCard key={index} item={item} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

interface IInfoCard {
  item: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  index: number;
}
const InfoCard = ({ item }: IInfoCard) => {
  return (
    <div className="border rounded-2xl p-4 flex flex-col gap-3 bg-background min-h-32 w-full">
      <div className="flex flex-col gap-3 flex-1">
        <div className="p-[10px] rounded-md text-primary bg-primary/10 w-min">
          {item.icon}
        </div>
        <h3 className="font-semibold text-primary text-lg wrap-break-word">
          {item.title}
        </h3>
        <p className="text-base text-muted-foreground wrap-break-word flex-1">
          {item.description}
        </p>
      </div>
    </div>
  );
};

export const FinalSection = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="max-w-3xl w-full items-center mx-auto flex flex-col gap-6 justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-2 items-center"
      >
        <h1 className=" font-semibold text-foreground text-2xl">
          A Fresh Start with a New User Experience
        </h1>
        <p className="text-md text-muted-foreground leading-relaxed text-center font-medium">
          erxes 3.0 is completely redesigned for a faster, more modern, and
          intuitive experience. This is just the start—expect more features and
          plugins soon.
        </p>
      </motion.div>
      <InfoList />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="flex gap-5 items-center text-center"
      >
        <div className="space-y-1">
          <p className="font-semibold text-foreground text-lg">
            What to expect
          </p>
          <p className="text-md text-muted-foreground leading-relaxed font-medium">
            At launch, only a few plugins will have the new UI. More updates are
            coming daily.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground text-lg">
            Your feedback shapes erxes
          </p>
          <p className="text-md text-muted-foreground leading-relaxed font-medium">
            Your input is essential! Share your feedback to help us improve.
          </p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.2, ease: 'easeOut' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="space-y-3 w-full"
      >
        <Button
          size="lg"
          className="w-full cursor-pointer"
          onClick={onContinue}
        >
          Start exploring
        </Button>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="text-center text-base text-muted-foreground"
        >
          We've worked hard to bring you this update. Now it's your turn to
          explore!
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

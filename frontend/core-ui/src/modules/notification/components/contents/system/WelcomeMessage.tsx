import {
  IconAddressBook,
  IconAffiliate,
  IconChartPie,
  IconFile,
  IconShoppingCart,
} from '@tabler/icons-react';
import {
  TOnboardingStepItem,
  WelcomeNotificationContentLayout,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';
const OnboardingSteps: TOnboardingStepItem[] = [
  {
    icon: <IconAddressBook className="size-5" />,
    title: 'Contacts',
    description: 'Keep all customer and lead information in one hub.',
    action: {
      label: 'Try it out now',
      to: '/contacts',
    },
  },
  {
    icon: <IconShoppingCart className="size-5" />,
    title: 'Products',
    forOwner: true,
    description:
      'Manage and showcase all your products or services in one place.',
    action: {
      label: 'Try it out now',
      to: 'settings/products',
    },
  },
  {
    icon: <IconChartPie className="size-5" />,
    title: 'Segments',
    forOwner: true,
    description:
      'Group customers by behavior, source, or data for targeted engagement.',
    action: {
      label: 'Try it out now',
      to: '/segments',
    },
  },
  {
    icon: <IconAffiliate className="size-5" />,
    title: 'Automation',
    forOwner: true,
    description: 'Automate repetitive tasks and save time.',
    action: {
      label: 'Try it out now',
      to: '/automations',
    },
  },
  {
    icon: <IconFile className="size-5" />,
    title: 'Documentation',
    forOwner: true,
    description:
      'Store and organize your docs, link them to tickets, conversations and tasks.',
    action: {
      label: 'Try it out now',
      to: '/documents',
    },
  },
];

export const WelcomeMessageContent = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  return (
    <WelcomeNotificationContentLayout
      title={t('welcome-title')}
      description={t('welcome-description')}
      videoSrc="https://youtu.be/W-dkAmrk96Q"
      onboardingSteps={OnboardingSteps}
    />
  );
};

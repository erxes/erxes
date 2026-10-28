import {
  Icon,
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandX,
  IconProps,
  IconWorldWww,
} from '@tabler/icons-react';

interface ILinkField {
  label: string;
  name: string;
  Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
}

export const USER_LINK_FIELDS = [
  {
    label: 'Facebook',
    name: 'facebook',
    Icon: IconBrandFacebook,
  },
  {
    label: 'Twitter',
    name: 'twitter',
    Icon: IconBrandX,
  },
  {
    label: 'Website',
    name: 'website',
    Icon: IconWorldWww,
  },
  {
    label: 'Discord',
    name: 'discord',
    Icon: IconBrandDiscord,
  },
  {
    label: 'GitHub',
    name: 'github',
    Icon: IconBrandGithub,
  },
  {
    label: 'Instagram',
    name: 'instagram',
    Icon: IconBrandInstagram,
  },
] as ILinkField[];

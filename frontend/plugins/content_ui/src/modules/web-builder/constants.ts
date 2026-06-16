import tourBoilerplate from '~/assets/template-screenshots/tour-boilerplate.png';
import tourTemplate0 from '~/assets/template-screenshots/tour-template-0.png';
import tourTemplate1 from '~/assets/template-screenshots/tour-template-1.png';
import tourTemplate2 from '~/assets/template-screenshots/tour-template-2.png';
import tourTemplate3 from '~/assets/template-screenshots/tour-template-3.png';
import tourTemplate6 from '~/assets/template-screenshots/tour-template-6.png';
import ecommerceBoilerplate from '~/assets/template-screenshots/ecommerce-boilerplate.png';
import ecommerceLux from '~/assets/template-screenshots/ecommerce-template-lux.png';
import ecommerceDark from '~/assets/template-screenshots/ecommerce-template-dark.png';
import ecommerceModern from '~/assets/template-screenshots/ecommerce-template-modern.png';

export const THUMBNAIL_GRADIENTS = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-orange-400 to-orange-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
  'bg-gradient-to-br from-indigo-400 to-indigo-600',
  'bg-gradient-to-br from-red-400 to-red-600',
  'bg-gradient-to-br from-yellow-400 to-yellow-600',
];

export const TEMPLATE_TYPES = [
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'tour', label: 'Tour' },
];

export const TEMPLATES = [
  {
    id: 'tour-template-0',
    type: 'tour',
    name: 'Summit Adventures',
    thumbnail: tourTemplate0,
    description:
      'A modern tour operator template with deep emerald green design, full-screen hero, tour cards, stats section, and testimonials. Built for adventure and travel companies.',
    screenshots: [tourTemplate0],
    primaryColor: '#065f46',
    secondaryColor: '#f59e0b',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A clean, modern template built specifically for tour operators.',
  },
  {
    id: 'template-boilerplate',
    type: 'ecommerce',
    name: 'Template Boilerplate',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce, hotel and tour flows with a clean, modern UI. Supports build-time live updates and production SSR rendering.',
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A flexible starter for multi-vertical sites with SSR support.',
  },
  {
    id: 'template-boilerplate',
    type: 'hotel',
    name: 'Template Boilerplate',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce, hotel and tour flows with a clean, modern UI. Supports build-time live updates and production SSR rendering.',
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A flexible starter for multi-vertical sites with SSR support.',
  },
  {
    id: 'template-boilerplate',
    type: 'tour',
    name: 'Template Boilerplate',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce, hotel and tour flows with a clean, modern UI. Supports build-time live updates and production SSR rendering.',
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A flexible starter for multi-vertical sites with SSR support.',
  },
    {
    id: "ecommerce-template-lux",
    type: "ecommerce",
    name: "Lux",
    thumbnail: ecommerceLux,
    description:
      "A clean, minimal ecommerce template inspired by premium retail aesthetics. Features a split-layout hero, image-first category cards, and a circular add-to-cart interaction. Neutral palette with generous whitespace.",
    screenshots: [ecommerceLux],
    primaryColor: "#171717",
    secondaryColor: "#f5f5f5",
    author: "erxes",
    authorUrl: "https://erxes.io",
    version: "1.0.0",
    review: "Premium minimal design for ecommerce stores that let the products speak.",
  },
  {
    id: "ecommerce-template-modern",
    type: "ecommerce",
    name: "Modern",
    thumbnail: ecommerceModern,
    description:
      "A clean, modern ecommerce template with a focus on user experience and performance. Features a responsive design, smooth animations, and a intuitive navigation structure.",
    screenshots: [ecommerceModern],
    primaryColor: "#34495e",
    secondaryColor: "#2c3e50",
    author: "erxes",
    authorUrl: "https://erxes.io",
    version: "1.0.0",
    review: "A modern approach to ecommerce design with a focus on user experience.",
  },
    {
    id: "ecommerce-template-dark",
    type: "ecommerce",
    name: "Dark",
    thumbnail: ecommerceDark,
    description:
      "A clean, dark ecommerce template with a focus on user experience and performance. Features a responsive design, smooth animations, and a intuitive navigation structure.",
    screenshots: [ecommerceDark],
    primaryColor: "#8b5cf6",
    secondaryColor: "#13111f",
    backgroundColor: "#09090f",
    textColor: "#ffffff",
    author: "erxes",
    authorUrl: "https://erxes.io",
    version: "1.0.0",
    review: "A dark approach to ecommerce design with a focus on user experience.",
  },
];

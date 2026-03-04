import tourBoilerplate from '~/assets/template-screenshots/tour-boilerplate.png';
import tourTemplate1 from '~/assets/template-screenshots/tour-template-1.png';
import tourTemplate2 from '~/assets/template-screenshots/tour-template-2.png';
import tourTemplate3 from '~/assets/template-screenshots/tour-template-3.png';
import tourTemplate6 from '~/assets/template-screenshots/tour-template-6.png';
import ecommerceBoilerplate from '~/assets/template-screenshots/ecommerce-boilerplate.png';

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
    id: 'tour-boilerplate',
    type: 'tour',
    name: 'Default Boilerplate',
    thumbnail: tourBoilerplate,
    description:
      'This template is ideal for launching your tour website with minimal effort. It features a simple, clean design with a focus on usability and flexibility. Perfect for beginners or those who want a quick setup without compromising quality.',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'A great starting template for those looking for simplicity and functionality.',
  },
  {
    id: 'tour-template-1',
    type: 'tour',
    name: 'Tour Website',
    thumbnail: tourTemplate1,
    description:
      'A professionally designed template to elevate your tour business. It includes multiple sections for highlighting destinations, pricing, and testimonials, making it an excellent choice for agencies and travel guides.',
    primaryColor: '#FAF7F2',
    secondaryColor: '#000',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'Perfect for creating visually appealing and informative tour websites.',
  },
  {
    id: 'tour-template-2',
    type: 'tour',
    name: 'Tour Website 2',
    thumbnail: tourTemplate2,
    description:
      'A feature-rich template designed for agencies to showcase their tour packages in style. It offers advanced layouts, dynamic image galleries, and detailed itinerary sections, providing a premium experience for users.',
    primaryColor: '#FFFFFF',
    secondaryColor: '#1a1a1a',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'Highly customizable and suitable for modern tour websites.',
  },
  {
    id: 'tour-template-3',
    type: 'tour',
    name: 'Tour Website 3',
    thumbnail: tourTemplate3,
    description:
      'Sleek and modern, this template is optimized for responsive design and performance. It includes built-in features like a booking form, customer testimonials, and pricing tables to make your tour website stand out.',
    primaryColor: '#000',
    secondaryColor: '#ffcc00',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'An ideal choice for a modern and dynamic tour website.',
  },
  {
    id: 'tour-template-6',
    type: 'tour',
    name: 'Tour Website 6',
    thumbnail: tourTemplate6,
    description:
      'With a focus on minimalism and clarity, this template is designed for travel bloggers, small agencies, and individual guides. It highlights destinations, reviews, and pricing in a clean layout.',
    primaryColor: '#000',
    secondaryColor: '#eee',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A fresh and clean approach to building tour-related websites.',
  },
  {
    id: 'tour-template-10',
    type: 'tour',
    name: 'Tour Website 10',
    thumbnail: tourTemplate6,
    description:
      'With a focus on minimalism and clarity, this template is designed for travel bloggers, small agencies, and individual guides. It highlights destinations, reviews, and pricing in a clean layout.',
    primaryColor: '#000',
    secondaryColor: '#eee',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A fresh and clean approach to building tour-related websites.',
  },
  {
    id: 'hotel-boilerplate',
    type: 'hotel',
    name: 'Hotel Boilerplate',
    thumbnail: tourTemplate6,
    description:
      "Tailored for the hospitality industry, this template includes sections for room listings, customer reviews, and contact forms. It's perfect for hotels, resorts, and bed-and-breakfast establishments.",
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'Perfect for hotels looking to establish a professional online presence.',
  },
  {
    id: 'hotel-template-2',
    type: 'hotel',
    name: 'Hotel Template 2',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce and tour flows with a clean, modern UI. Supports build-time live updates and production SSR rendering.',
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A flexible starter for multi-vertical sites with SSR support.',
  },
  {
    id: 'ecommerce-boilerplate',
    type: 'ecommerce',
    name: 'Ecommerce Boilerplate',
    thumbnail: ecommerceBoilerplate,
    description:
      "Tailored for the ecommerce industry, this template includes sections for product listings, customer reviews, and contact forms. It's perfect for online stores and marketplaces.",
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'Perfect for ecommerce businesses looking to establish a professional online presence.',
  },
  {
    id: 'template-boilerplate',
    type: 'ecommerce',
    name: 'Template Boilerplate',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce and tour flows with a clean, modern UI. Supports build-time live updates and production SSR rendering.',
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A flexible starter for multi-vertical sites with SSR support.',
  },
  {
    id: 'ecommerce-template-5',
    type: 'ecommerce',
    name: 'Ecommerce Template 5',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce and tour flows with a clean, modern UI. Supports build-time live updates and production SSR rendering.',
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A flexible starter for multi-vertical sites with SSR support.',
  },
  {
    id: 'ecommerce-template-6',
    type: 'ecommerce',
    name: 'Ecommerce Template 6',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce and tour flows with a clean, modern UI. Supports build-time live updates and production SSR rendering.',
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A flexible starter for multi-vertical sites with SSR support.',
  },
  {
    id: 'ecommerce-template-7',
    type: 'ecommerce',
    name: 'Ecommerce Template 7',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce and tour flows with a clean, modern UI. Supports build-time live updates and production SSR rendering.',
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review: 'A flexible starter for multi-vertical sites with SSR support.',
  },
];

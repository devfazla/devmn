import coverHealth from './assets/proj-health.jpg';
import coverSuper from './assets/proj-super.jpg';
import coverSports from './assets/proj-sports.jpg';

export const skills = [
  {
    icon: 'fab fa-android',
    title: 'Android',
    chips: ['Java', 'Kotlin', 'Material Design', 'REST APIs'],
  },
  {
    icon: 'fas fa-mobile-alt',
    title: 'Flutter',
    chips: ['Dart', 'Cross-platform', 'Firebase', 'State management'],
  },
  {
    icon: 'fas fa-code',
    title: 'Web',
    chips: ['JavaScript', 'Responsive', 'PWAs', 'Modern frameworks'],
  },
  {
    icon: 'fas fa-palette',
    title: 'Design & UI/UX',
    chips: ['Figma', 'Adobe CC', 'Prototyping', 'User research'],
  },
  {
    icon: 'fas fa-users',
    title: 'Team & Delivery',
    chips: ['Agile', 'Git', 'Leadership', 'Documentation'],
  },
];

export const projects = [
  {
    title: 'AI Health Doctor',
    description:
      'Healthcare app with AI prescription reading, medicine reminders and round-the-clock specialist support.',
    tags: ['Flutter', 'Firebase', 'AI'],
    cover: coverHealth,
    coverAlt: 'AI Health Doctor app cover',
  },
  {
    title: 'Project Super',
    description:
      'Team project management with tasks, schedules, roles and organisation-wide collaboration.',
    tags: ['Web', 'Realtime', 'Admin'],
    cover: coverSuper,
    coverAlt: 'Project Super platform cover',
  },
  {
    title: 'NexGen Sports',
    description:
      'Sports e-commerce with payments, offers and full product and order management.',
    tags: ['E-commerce', 'Payments', 'PWA'],
    cover: coverSports,
    coverAlt: 'NexGen Sports store cover',
  },
];

export const themes = [
  { id: 'default', label: 'Default' },
  { id: 'neo-brutalism', label: 'Neo-Brutalism' },
  { id: 'neumorphism', label: 'Neumorphism' },
  { id: 'glassmorphism', label: 'Glassmorphism' },
  { id: 'material', label: 'Material' },
  { id: 'claymorphism', label: 'Claymorphism' },
];

export const socialLinks = [
  { icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/in/fzlr', label: 'LinkedIn' },
  { icon: 'fab fa-github', href: 'https://github.com/fazla-cloud', label: 'GitHub' },
  { icon: 'fab fa-twitter', href: 'https://x.com/fazla_fr', label: 'Twitter' },
  { icon: 'fab fa-instagram', href: 'https://instagram.com/fazlarabbi', label: 'Instagram' },
  { icon: 'fas fa-envelope', href: 'mailto:hello@devfazla.com', label: 'Email' },
];

export const siteConfig = {
  name: import.meta.env.VITE_APP_NAME || 'MyHomeManager',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'Manage your household tasks, groceries, expenses, and family schedules all in one place.',
  url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  ogImage: '/og-image.png',
  links: {
    github: 'https://github.com/yourusername/myhomemanager',
    twitter: 'https://twitter.com/myhomemanager',
  },
  creator: 'MyHomeManager Team',
  keywords: [
    'home management',
    'family organization',
    'chores',
    'groceries',
    'expenses',
    'reminders',
    'family tasks',
    'household management',
  ],
} 
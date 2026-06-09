import type { AuditorConfig } from 'a11y-auditor-agent';

const config: AuditorConfig = {
  wcag: {
    version: '2.2',
    level: 'AA',
  },

  baseUrl: process.env.APP_URL ?? 'http://localhost:5173',

  routes: [
    { path: '/', name: 'Home' },
    // { path: '/settings', name: 'Settings', auth: 'logged-in' },
  ],

  // auth: {
  //   profiles: {
  //     'logged-in': { storageState: './e2e/.auth/user.json' },
  //   },
  // },

  // scenarios: [
  //   {
  //     name: 'Main menu open',
  //     route: '/',
  //     steps: ['click [data-testid=menu-toggle]'],
  //   },
  // ],

  variants: ['default', 'dark'],

  thresholds: {
    failOn: ['critical', 'serious'],
    maxViolations: 0,
  },

  axe: {
    disableRules: [],
    // include: ['main'],
    // exclude: ['.third-party-widget'],
  },

  output: {
    dir: './a11y-reports',
    formats: ['json', 'html'],
  },
};

export default config;

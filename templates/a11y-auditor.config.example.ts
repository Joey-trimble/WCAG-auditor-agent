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
  //     name: 'Mobile menu open',
  //     route: '/',
  //     steps: ['click [data-testid=menu-toggle]', 'wait 300ms'],
  //   },
  //   {
  //     name: 'Settings dialog',
  //     route: '/settings',
  //     steps: ['click #open-settings', 'wait 300ms'],
  //   },
  // ],

  // behavioral: { enabled: true },

  // Phase 5 — static analysis (requires eslint + eslint-plugin-jsx-a11y in your project)
  // static: {
  //   enabled: true,
  //   globs: ['src/**/*.{tsx,jsx}'],
  // },

  // Compare against a saved baseline report for regressions
  // baseline: { file: './a11y-reports/baseline.json' },

  variants: ['default', 'dark', 'reduced-motion'],

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
    formats: ['json', 'html', 'sarif'],
  },

  // waivers: { file: './a11y-waivers.json' },
};

export default config;

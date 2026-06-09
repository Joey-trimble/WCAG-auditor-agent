import type { Page } from '@playwright/test';
import type { PageVariant } from '../types';

export async function applyVariant(page: Page, variant: PageVariant): Promise<void> {
  switch (variant) {
    case 'dark':
      await page.emulateMedia({ colorScheme: 'dark' });
      break;
    case 'zoom-200':
      await page.setViewportSize({ width: 640, height: 480 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
      });
      break;
    case 'reduced-motion':
      await page.emulateMedia({ reducedMotion: 'reduce' });
      break;
    case 'default':
    default:
      await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
      break;
  }
}

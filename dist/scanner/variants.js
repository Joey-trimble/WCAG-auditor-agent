"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyVariant = applyVariant;
async function applyVariant(page, variant) {
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
//# sourceMappingURL=variants.js.map
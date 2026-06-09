"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBehavioralChecks = runBehavioralChecks;
exports.extractNavSignature = extractNavSignature;
exports.runCrossPageChecks = runCrossPageChecks;
const finding_factory_1 = require("./finding-factory");
const MIN_TARGET_PX = 24;
async function runBehavioralChecks(page, config, ctx) {
    const findings = [];
    const passedCriteria = [];
    const passedChecks = [];
    const source = 'behavioral';
    const factoryCtx = { ...ctx, source };
    if (ctx.variant === 'default' || ctx.variant === 'zoom-200') {
        await checkPageTitle(page, config, factoryCtx, findings, passedCriteria, passedChecks);
        await checkHtmlLang(page, config, factoryCtx, findings, passedCriteria, passedChecks);
        await checkMainLandmark(page, config, factoryCtx, findings, passedCriteria, passedChecks);
        await checkPageHeading(page, config, factoryCtx, findings, passedCriteria, passedChecks);
        await checkSkipLink(page, config, factoryCtx, findings, passedCriteria, passedChecks);
        await checkViewportZoom(page, config, factoryCtx, findings, passedCriteria, passedChecks);
        await checkUnlabeledInputs(page, config, factoryCtx, findings, passedCriteria, passedChecks);
        await checkTargetSize(page, config, factoryCtx, findings, passedCriteria, passedChecks);
        await checkFocusNotObscured(page, config, factoryCtx, findings, passedCriteria, passedChecks);
    }
    if (ctx.variant === 'default' || ctx.variant === 'zoom-200') {
        await checkReflow(page, config, factoryCtx, findings, passedCriteria, passedChecks, ctx.variant);
    }
    if (ctx.variant === 'reduced-motion') {
        await checkReducedMotion(page, config, factoryCtx, findings, passedCriteria, passedChecks);
    }
    if (ctx.variant === 'default' && !ctx.scenario) {
        await checkFormErrors(page, config, factoryCtx, findings, passedCriteria, passedChecks);
    }
    return { findings, passedCriteria, passedChecks };
}
async function checkPageTitle(page, config, ctx, findings, passed, passedChecks) {
    const title = await page.title();
    const trimmed = title.trim();
    if (!trimmed) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-page-title',
            summary: 'Page is missing a document title',
            description: 'The document <title> is empty. WCAG 2.4.2 requires descriptive page titles.',
            selector: 'title',
            criteria: ['2.4.2'],
            impact: 'serious',
            remediation: 'Add a unique, descriptive <title> element in the document head.',
        }));
        return;
    }
    passed.push('2.4.2');
    passedChecks.push('behavioral-page-title');
}
async function checkHtmlLang(page, config, ctx, findings, passed, passedChecks) {
    const lang = await page.locator('html').getAttribute('lang');
    if (!lang || !lang.trim()) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-html-lang',
            summary: 'Page language is not defined',
            description: 'The <html> element is missing a valid lang attribute. WCAG 3.1.1 requires a page language.',
            selector: 'html',
            criteria: ['3.1.1'],
            impact: 'serious',
            remediation: 'Add lang attribute to <html>, e.g. <html lang="en">.',
        }));
        return;
    }
    passed.push('3.1.1');
    passedChecks.push('behavioral-html-lang');
}
async function checkMainLandmark(page, config, ctx, findings, passed, passedChecks) {
    const hasMain = (await page.locator('main, [role="main"]').count()) > 0;
    if (!hasMain) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-main-landmark',
            summary: 'Page is missing a main landmark',
            description: 'No <main> or role="main" landmark found. Landmarks support bypass and structure (WCAG 1.3.1, 2.4.1).',
            selector: 'body',
            criteria: ['1.3.1', '2.4.1'],
            impact: 'moderate',
            remediation: 'Wrap primary content in <main> or add role="main" to the primary content container.',
        }));
        return;
    }
    passed.push('1.3.1');
    passedChecks.push('behavioral-main-landmark');
}
async function checkPageHeading(page, config, ctx, findings, passed, passedChecks) {
    const h1Count = await page.locator('h1').count();
    if (h1Count === 0) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-page-h1',
            summary: 'Page is missing a level-one heading',
            description: 'No <h1> found. A single h1 helps structure and navigation (WCAG 1.3.1, 2.4.6).',
            selector: 'body',
            criteria: ['1.3.1', '2.4.6'],
            impact: 'moderate',
            remediation: 'Add one <h1> describing the page topic.',
        }));
        return;
    }
    if (h1Count > 1) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-multiple-h1',
            summary: 'Page has multiple h1 elements',
            description: `Found ${h1Count} <h1> elements. Multiple h1s can confuse heading structure.`,
            selector: 'h1',
            criteria: ['1.3.1'],
            impact: 'minor',
            remediation: 'Use a single <h1> per page; use h2–h6 for subsections.',
            needsManualReview: true,
        }));
        return;
    }
    passedChecks.push('behavioral-page-h1');
}
async function checkSkipLink(page, config, ctx, findings, passed, passedChecks) {
    const skipInfo = await page.evaluate(() => {
        const skipPattern = /skip|jump|main content|go to main/i;
        const links = [...document.querySelectorAll('a[href^="#"]')];
        const skipLink = links.find((a) => skipPattern.test(a.textContent ?? '') || a.className.includes('skip'));
        const mainTarget = document.querySelector('main, [role="main"], #main, #content');
        const hasHashToMain = links.some((a) => {
            const href = a.getAttribute('href') ?? '';
            const target = document.querySelector(href);
            return target === mainTarget || href === '#main' || href === '#content';
        });
        return {
            hasSkipLink: Boolean(skipLink || hasHashToMain),
            focusableCount: document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length,
        };
    });
    if (skipInfo.hasSkipLink) {
        passed.push('2.4.1');
        passedChecks.push('behavioral-skip-link');
        return;
    }
    if (skipInfo.focusableCount > 15) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-skip-link',
            summary: 'No skip link detected on a content-heavy page',
            description: 'No skip navigation link found and the page has many focusable elements. Users may need to tab through repetitive content (WCAG 2.4.1).',
            selector: 'body',
            criteria: ['2.4.1'],
            impact: 'moderate',
            remediation: 'Add a visible-on-focus skip link as the first focusable element, targeting #main or the main landmark.',
            needsManualReview: true,
        }));
        return;
    }
    passedChecks.push('behavioral-skip-link-optional');
}
async function checkViewportZoom(page, config, ctx, findings, passed, passedChecks) {
    const viewportMeta = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        if (!meta) {
            return { found: false, content: '' };
        }
        return { found: true, content: (meta.getAttribute('content') ?? '').toLowerCase() };
    });
    if (!viewportMeta.found) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-viewport-meta',
            summary: 'Viewport meta tag is missing',
            description: 'No viewport meta tag found. Mobile zoom and reflow may be impaired (WCAG 1.4.4, 1.4.10).',
            selector: 'head',
            criteria: ['1.4.4', '1.4.10'],
            impact: 'moderate',
            remediation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
        }));
        return;
    }
    const blocksZoom = viewportMeta.content.includes('user-scalable=no') ||
        viewportMeta.content.includes('user-scalable=0') ||
        /maximum-scale\s*=\s*1(?:\.0)?(?![0-9])/.test(viewportMeta.content);
    if (blocksZoom) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-viewport-zoom',
            summary: 'Viewport meta tag prevents zoom',
            description: `Viewport content "${viewportMeta.content}" restricts zoom. Users must be able to scale to 200% (WCAG 1.4.4).`,
            selector: 'meta[name="viewport"]',
            criteria: ['1.4.4'],
            impact: 'serious',
            remediation: 'Remove user-scalable=no and maximum-scale=1; allow pinch-zoom up to 200%.',
        }));
        return;
    }
    passed.push('1.4.4');
    passedChecks.push('behavioral-viewport-zoom');
}
async function checkUnlabeledInputs(page, config, ctx, findings, passed, passedChecks) {
    const unlabeled = await page.evaluate(() => {
        const inputs = [
            ...document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"])'),
            ...document.querySelectorAll('select'),
            ...document.querySelectorAll('textarea'),
        ];
        return inputs
            .filter((el) => {
            const id = el.id;
            const hasAria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
            const hasTitle = el.getAttribute('title');
            const hasLabel = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
            const wrapped = el.closest('label');
            return !hasAria && !hasTitle && !hasLabel && !wrapped;
        })
            .slice(0, 5)
            .map((el) => {
            const htmlEl = el;
            return htmlEl.id ? `#${htmlEl.id}` : htmlEl.tagName.toLowerCase();
        });
    });
    if (unlabeled.length > 0) {
        for (const selector of unlabeled) {
            findings.push((0, finding_factory_1.createFinding)(config, ctx, {
                rule: 'behavioral-unlabeled-input',
                summary: 'Form control is missing an accessible name',
                description: 'Input has no associated label, aria-label, or aria-labelledby (WCAG 3.3.2, 4.1.2).',
                selector,
                criteria: ['3.3.2', '4.1.2'],
                impact: 'serious',
                remediation: 'Associate a <label> with the control or provide aria-label / aria-labelledby.',
            }));
        }
        return;
    }
    passed.push('3.3.2');
    passedChecks.push('behavioral-unlabeled-input');
}
async function checkTargetSize(page, config, ctx, findings, passed, passedChecks) {
    if (config.wcag.version !== '2.2') {
        return;
    }
    const smallTargets = await page.evaluate((minPx) => {
        const selectors = 'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"]';
        const elements = [...document.querySelectorAll(selectors)];
        return elements
            .filter((el) => {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') {
                return false;
            }
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                return false;
            }
            // Inline text links in paragraphs are exempt
            if (el.tagName === 'A' && el.closest('p, li, span, td')) {
                const text = (el.textContent ?? '').trim();
                if (text.length > 0 && rect.height < minPx * 1.5) {
                    return false;
                }
            }
            return rect.width < minPx || rect.height < minPx;
        })
            .slice(0, 5)
            .map((el) => {
            const htmlEl = el;
            const rect = htmlEl.getBoundingClientRect();
            const sel = htmlEl.id ? `#${htmlEl.id}` : htmlEl.tagName.toLowerCase();
            return { selector: sel, width: Math.round(rect.width), height: Math.round(rect.height) };
        });
    }, MIN_TARGET_PX);
    if (smallTargets.length > 0) {
        for (const target of smallTargets) {
            findings.push((0, finding_factory_1.createFinding)(config, ctx, {
                rule: 'behavioral-target-size',
                summary: 'Interactive target may be too small',
                description: `Target measures ${target.width}×${target.height}px; WCAG 2.5.8 requires at least ${MIN_TARGET_PX}×${MIN_TARGET_PX}px (with exceptions).`,
                selector: target.selector,
                criteria: ['2.5.8'],
                impact: 'moderate',
                remediation: `Increase clickable area to at least ${MIN_TARGET_PX}×${MIN_TARGET_PX} CSS pixels via size or padding.`,
                needsManualReview: true,
            }));
        }
        return;
    }
    passed.push('2.5.8');
    passedChecks.push('behavioral-target-size');
}
async function checkFocusNotObscured(page, config, ctx, findings, passed, passedChecks) {
    if (config.wcag.version !== '2.2') {
        return;
    }
    const obscured = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) {
            document.body.focus();
        }
        const focusable = [
            ...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        ].filter((node) => {
            const html = node;
            return html.offsetParent !== null || html === document.body;
        });
        const target = (focusable[0] ?? document.body);
        target.focus();
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const topEl = document.elementFromPoint(centerX, centerY);
        if (!topEl) {
            return null;
        }
        const isObscured = topEl !== target && !target.contains(topEl) && !topEl.contains(target);
        if (!isObscured) {
            return null;
        }
        const obscurer = topEl;
        const style = window.getComputedStyle(obscurer);
        const fixed = style.position === 'fixed' || style.position === 'sticky';
        if (!fixed) {
            return null;
        }
        return {
            focused: target.id ? `#${target.id}` : target.tagName.toLowerCase(),
            obscurer: obscurer.id ? `#${obscurer.id}` : obscurer.tagName.toLowerCase(),
        };
    });
    if (obscured) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-focus-obscured',
            summary: 'Focused element may be obscured by fixed content',
            description: `Focus on ${obscured.focused} appears covered by ${obscured.obscurer}. WCAG 2.4.11 requires focus not be substantially hidden.`,
            selector: obscured.focused,
            criteria: ['2.4.11'],
            impact: 'moderate',
            remediation: 'Ensure sticky headers, footers, or overlays do not hide focused elements.',
            needsManualReview: true,
        }));
        return;
    }
    passed.push('2.4.11');
    passedChecks.push('behavioral-focus-obscured');
}
async function checkReflow(page, config, ctx, findings, passed, passedChecks, variant) {
    const originalSize = page.viewportSize();
    try {
        await page.setViewportSize({ width: 320, height: 568 });
        const overflow = await page.evaluate(() => {
            const doc = document.documentElement;
            return {
                scrollWidth: doc.scrollWidth,
                clientWidth: doc.clientWidth,
                hasHorizontalScroll: doc.scrollWidth > doc.clientWidth + 2,
            };
        });
        if (overflow.hasHorizontalScroll) {
            findings.push((0, finding_factory_1.createFinding)(config, ctx, {
                rule: 'behavioral-reflow',
                summary: 'Horizontal scrolling required at 320px width',
                description: `Content width (${overflow.scrollWidth}px) exceeds viewport (${overflow.clientWidth}px). WCAG 1.4.10 requires content reflow without horizontal scrolling at 320px.`,
                selector: 'html',
                criteria: ['1.4.10'],
                impact: 'serious',
                remediation: 'Use responsive layout so content reflows at 320px width without two-dimensional scrolling.',
            }));
            return;
        }
        passed.push('1.4.10');
        passedChecks.push(`behavioral-reflow-${variant}`);
    }
    finally {
        if (originalSize) {
            await page.setViewportSize(originalSize);
        }
    }
}
async function checkReducedMotion(page, config, ctx, findings, passed, passedChecks) {
    const animatedCount = await page.evaluate(() => {
        let count = 0;
        for (const el of document.querySelectorAll('*')) {
            const style = window.getComputedStyle(el);
            const anim = parseFloat(style.animationDuration) || 0;
            const trans = parseFloat(style.transitionDuration) || 0;
            if (anim > 0.01 || trans > 0.3) {
                count++;
            }
        }
        return count;
    });
    if (animatedCount > 5) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-reduced-motion',
            summary: 'Animations may not respect prefers-reduced-motion',
            description: `${animatedCount} elements have active animations/transitions while reduced-motion is enabled. WCAG 2.3.3 requires motion effects can be disabled.`,
            selector: 'html',
            criteria: ['2.3.3'],
            impact: 'moderate',
            remediation: 'Use @media (prefers-reduced-motion: reduce) to disable or reduce animations.',
            needsManualReview: true,
        }));
        return;
    }
    passed.push('2.3.3');
    passedChecks.push('behavioral-reduced-motion');
}
async function checkFormErrors(page, config, ctx, findings, passed, passedChecks) {
    const hasForm = await page.evaluate(() => document.querySelectorAll('form').length > 0);
    if (!hasForm) {
        return;
    }
    const submitButton = page.locator('form button[type="submit"], form input[type="submit"]').first();
    const submitExists = (await submitButton.count()) > 0;
    if (!submitExists) {
        return;
    }
    await submitButton.click({ timeout: 3000 }).catch(() => undefined);
    await page.waitForTimeout(500);
    const errorState = await page.evaluate(() => {
        const invalidFields = [...document.querySelectorAll('[aria-invalid="true"], input:invalid, select:invalid, textarea:invalid')];
        const errorMessages = [...document.querySelectorAll('[role="alert"], .error, [class*="error"], [id*="error"]')].filter((el) => (el.textContent ?? '').trim().length > 0);
        return {
            invalidCount: invalidFields.length,
            errorMessageCount: errorMessages.length,
            unlinkedInvalid: invalidFields.filter((field) => {
                const id = field.getAttribute('id');
                const describedBy = field.getAttribute('aria-describedby');
                if (describedBy) {
                    return false;
                }
                if (id) {
                    const label = document.querySelector(`label[for="${id}"]`);
                    const err = document.querySelector(`[id="${id}-error"], [aria-describedby*="${id}"]`);
                    return !label && !err;
                }
                return true;
            }).length,
        };
    });
    if (errorState.invalidCount > 0 && errorState.errorMessageCount === 0) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-form-errors',
            summary: 'Invalid fields without visible error messages',
            description: `${errorState.invalidCount} invalid field(s) found after submit but no error text detected. WCAG 3.3.1 requires errors be identified in text.`,
            selector: 'form',
            criteria: ['3.3.1'],
            impact: 'serious',
            remediation: 'Display text error messages and associate them with fields via aria-describedby.',
        }));
        return;
    }
    if (errorState.unlinkedInvalid > 0) {
        findings.push((0, finding_factory_1.createFinding)(config, ctx, {
            rule: 'behavioral-form-error-association',
            summary: 'Invalid fields may lack programmatic error association',
            description: `${errorState.unlinkedInvalid} invalid field(s) without aria-describedby or linked error element.`,
            selector: 'form',
            criteria: ['3.3.1', '3.3.3'],
            impact: 'moderate',
            remediation: 'Link error messages to inputs with aria-describedby pointing to error element id.',
            needsManualReview: true,
        }));
        return;
    }
    if (errorState.invalidCount > 0) {
        passed.push('3.3.1');
        passedChecks.push('behavioral-form-errors');
    }
}
async function extractNavSignature(page, route) {
    const links = await page.evaluate(() => {
        const nav = document.querySelector('nav, [role="navigation"]');
        if (!nav) {
            return [];
        }
        return [...nav.querySelectorAll('a[href]')].map((a) => ({
            text: (a.textContent ?? '').trim().replace(/\s+/g, ' '),
            href: a.getAttribute('href') ?? '',
        }));
    });
    return { route, links };
}
function runCrossPageChecks(config, signatures) {
    const findings = [];
    const passedCriteria = [];
    const passedChecks = [];
    const source = 'behavioral';
    if (signatures.length < 2) {
        return { findings, passedCriteria, passedChecks };
    }
    const withNav = signatures.filter((s) => s.links.length > 0);
    if (withNav.length < 2) {
        return { findings, passedCriteria, passedChecks };
    }
    const baseline = withNav[0];
    const baselineHrefs = new Set(baseline.links.map((l) => l.href));
    for (const sig of withNav.slice(1)) {
        const missing = baseline.links.filter((l) => !sig.links.some((s) => s.href === l.href));
        const extra = sig.links.filter((l) => !baselineHrefs.has(l.href));
        if (missing.length > 2 || extra.length > 2) {
            findings.push((0, finding_factory_1.createFinding)(config, { route: sig.route, variant: 'default', source }, {
                rule: 'behavioral-consistent-nav',
                summary: 'Navigation links differ across pages',
                description: `Navigation on ${sig.route} differs from ${baseline.route}. WCAG 3.2.3 requires consistent navigation across pages.`,
                selector: 'nav, [role="navigation"]',
                criteria: ['3.2.3'],
                impact: 'moderate',
                remediation: 'Keep primary navigation links and order consistent across pages.',
                needsManualReview: true,
            }));
        }
    }
    if (findings.length === 0) {
        passedCriteria.push('3.2.3');
        passedChecks.push('behavioral-consistent-nav');
    }
    return { findings, passedCriteria, passedChecks };
}
//# sourceMappingURL=behavioral.js.map
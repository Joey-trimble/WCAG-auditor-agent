"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStaticAnalysis = runStaticAnalysis;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const finding_factory_1 = require("./finding-factory");
/** Maps eslint-plugin-jsx-a11y rules to WCAG success criteria. */
const JSX_A11Y_WCAG_MAP = {
    'jsx-a11y/alt-text': { criteria: ['1.1.1'], impact: 'serious' },
    'jsx-a11y/anchor-has-content': { criteria: ['2.4.4'], impact: 'moderate' },
    'jsx-a11y/anchor-is-valid': { criteria: ['2.4.4'], impact: 'serious' },
    'jsx-a11y/aria-activedescendant-has-tabindex': { criteria: ['4.1.2'], impact: 'serious' },
    'jsx-a11y/aria-props': { criteria: ['4.1.2'], impact: 'serious' },
    'jsx-a11y/aria-proptypes': { criteria: ['4.1.2'], impact: 'serious' },
    'jsx-a11y/aria-role': { criteria: ['4.1.2'], impact: 'serious' },
    'jsx-a11y/aria-unsupported-elements': { criteria: ['4.1.2'], impact: 'serious' },
    'jsx-a11y/click-events-have-key-events': { criteria: ['2.1.1'], impact: 'serious' },
    'jsx-a11y/heading-has-content': { criteria: ['1.3.1', '2.4.6'], impact: 'moderate' },
    'jsx-a11y/html-has-lang': { criteria: ['3.1.1'], impact: 'serious' },
    'jsx-a11y/iframe-has-title': { criteria: ['4.1.2'], impact: 'serious' },
    'jsx-a11y/img-redundant-alt': { criteria: ['1.1.1'], impact: 'minor' },
    'jsx-a11y/interactive-supports-focus': { criteria: ['2.1.1'], impact: 'serious' },
    'jsx-a11y/label-has-associated-control': { criteria: ['3.3.2', '4.1.2'], impact: 'serious' },
    'jsx-a11y/media-has-caption': { criteria: ['1.2.2'], impact: 'serious' },
    'jsx-a11y/mouse-events-have-key-events': { criteria: ['2.1.1'], impact: 'serious' },
    'jsx-a11y/no-access-key': { criteria: ['2.1.4'], impact: 'moderate' },
    'jsx-a11y/no-autofocus': { criteria: ['2.4.3'], impact: 'moderate' },
    'jsx-a11y/no-distracting-elements': { criteria: ['2.2.2'], impact: 'serious' },
    'jsx-a11y/no-interactive-element-to-noninteractive-role': { criteria: ['4.1.2'], impact: 'serious' },
    'jsx-a11y/no-noninteractive-element-interactions': { criteria: ['2.1.1'], impact: 'serious' },
    'jsx-a11y/no-noninteractive-element-to-interactive-role': { criteria: ['4.1.2'], impact: 'serious' },
    'jsx-a11y/no-noninteractive-tabindex': { criteria: ['2.4.3'], impact: 'serious' },
    'jsx-a11y/no-redundant-roles': { criteria: ['4.1.2'], impact: 'minor' },
    'jsx-a11y/no-static-element-interactions': { criteria: ['2.1.1'], impact: 'serious' },
    'jsx-a11y/role-has-required-aria-props': { criteria: ['4.1.2'], impact: 'serious' },
    'jsx-a11y/role-supports-aria-props': { criteria: ['4.1.2'], impact: 'serious' },
    'jsx-a11y/scope': { criteria: ['1.3.1'], impact: 'moderate' },
    'jsx-a11y/tabindex-no-positive': { criteria: ['2.4.3'], impact: 'serious' },
};
function runStaticAnalysis(cwd, config) {
    const warnings = [];
    const findings = [];
    if (config.static?.enabled !== true) {
        return { findings, filesScanned: 0, warnings };
    }
    const globs = config.static?.globs ?? ['src/**/*.{tsx,jsx,ts,js}'];
    const eslintConfig = config.static?.eslintConfig;
    const packageJson = (0, path_1.resolve)(cwd, 'package.json');
    if (!(0, fs_1.existsSync)(packageJson)) {
        warnings.push('Static analysis skipped: no package.json found in project root.');
        return { findings, filesScanned: 0, warnings };
    }
    const eslintArgs = [
        'eslint',
        ...globs,
        '--format',
        'json',
        '--no-error-on-unmatched-pattern',
    ];
    if (eslintConfig) {
        eslintArgs.push('--config', eslintConfig);
    }
    const result = (0, child_process_1.spawnSync)('npx', eslintArgs, {
        cwd,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
        shell: process.platform === 'win32',
    });
    if (result.error) {
        warnings.push(`Static analysis failed: ${result.error.message}`);
        return { findings, filesScanned: 0, warnings };
    }
    const stdout = result.stdout?.trim();
    if (!stdout) {
        if (result.status === 127 || result.stderr?.includes('eslint')) {
            warnings.push('Static analysis skipped: ESLint not available. Install eslint and eslint-plugin-jsx-a11y in your project.');
        }
        return { findings, filesScanned: 0, warnings };
    }
    let eslintResults;
    try {
        eslintResults = JSON.parse(stdout);
    }
    catch {
        warnings.push('Static analysis skipped: could not parse ESLint JSON output.');
        return { findings, filesScanned: 0, warnings };
    }
    const filesScanned = eslintResults.filter((r) => r.messages.length > 0 || r.errorCount > 0).length;
    for (const fileResult of eslintResults) {
        const relativePath = fileResult.filePath.replace(`${cwd}/`, '').replace(/\\/g, '/');
        for (const msg of fileResult.messages) {
            if (!msg.ruleId || !msg.ruleId.startsWith('jsx-a11y/')) {
                continue;
            }
            const mapping = JSX_A11Y_WCAG_MAP[msg.ruleId] ?? {
                criteria: ['4.1.2'],
                impact: 'moderate',
            };
            const finding = (0, finding_factory_1.createFinding)(config, { route: relativePath, variant: 'default', source: 'static' }, {
                rule: msg.ruleId,
                summary: msg.message,
                description: `ESLint ${msg.ruleId} at line ${msg.line}, column ${msg.column}.`,
                selector: `${relativePath}:${msg.line}:${msg.column}`,
                criteria: mapping.criteria,
                impact: mapping.impact,
                remediation: `Fix ${msg.ruleId} violation in source file.`,
            });
            finding.filePath = relativePath;
            finding.line = msg.line;
            finding.column = msg.column;
            findings.push(finding);
        }
    }
    return { findings, filesScanned: eslintResults.length, warnings };
}
//# sourceMappingURL=static.js.map
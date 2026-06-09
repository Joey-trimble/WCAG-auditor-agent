"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_VARIANTS = void 0;
exports.getWcagTags = getWcagTags;
exports.mergeConfig = mergeConfig;
exports.findConfigPath = findConfigPath;
exports.loadConfig = loadConfig;
exports.evaluateThresholds = evaluateThresholds;
const fs_1 = require("fs");
const path_1 = require("path");
const CONFIG_NAMES = [
    'a11y-auditor.config.ts',
    'a11y-auditor.config.mts',
    'a11y-auditor.config.js',
    'a11y-auditor.config.mjs',
    'a11y-auditor.config.json',
];
const DEFAULT_CONFIG = {
    wcag: { version: '2.2', level: 'AA' },
    baseUrl: 'http://localhost:5173',
    routes: [{ path: '/', name: 'Home' }],
    variants: ['default'],
    thresholds: {
        failOn: ['critical', 'serious'],
        maxViolations: 0,
    },
    output: {
        dir: './a11y-reports',
        formats: ['json', 'html'],
    },
};
function getWcagTags(version, level) {
    const tags = new Set(['wcag2a']);
    if (level === 'A' || level === 'AA' || level === 'AAA') {
        if (version === '2.1' || version === '2.2') {
            tags.add('wcag21a');
        }
    }
    if (level === 'AA' || level === 'AAA') {
        tags.add('wcag2aa');
        tags.add('wcag21aa');
        if (version === '2.2') {
            tags.add('wcag22aa');
        }
    }
    if (level === 'AAA') {
        tags.add('wcag2aaa');
        tags.add('wcag21aaa');
        if (version === '2.2') {
            tags.add('wcag22aaa');
        }
    }
    return [...tags];
}
function mergeConfig(partial) {
    return {
        ...DEFAULT_CONFIG,
        ...partial,
        wcag: { ...DEFAULT_CONFIG.wcag, ...partial.wcag },
        thresholds: { ...DEFAULT_CONFIG.thresholds, ...partial.thresholds },
        output: { ...DEFAULT_CONFIG.output, ...partial.output },
        axe: partial.axe ? { ...partial.axe } : undefined,
        auth: partial.auth,
        scenarios: partial.scenarios,
        variants: partial.variants ?? DEFAULT_CONFIG.variants,
        routes: partial.routes ?? DEFAULT_CONFIG.routes,
        baseUrl: partial.baseUrl ?? DEFAULT_CONFIG.baseUrl,
    };
}
function findConfigPath(cwd, explicitPath) {
    if (explicitPath) {
        const resolved = (0, path_1.resolve)(cwd, explicitPath);
        if (!(0, fs_1.existsSync)(resolved)) {
            throw new Error(`Config file not found: ${resolved}`);
        }
        return resolved;
    }
    for (const name of CONFIG_NAMES) {
        const candidate = (0, path_1.resolve)(cwd, name);
        if ((0, fs_1.existsSync)(candidate)) {
            return candidate;
        }
    }
    throw new Error(`No config found in ${cwd}. Run "a11y-auditor init" or add a11y-auditor.config.ts`);
}
async function loadConfig(cwd, explicitPath) {
    const configPath = findConfigPath(cwd, explicitPath);
    if (configPath.endsWith('.json')) {
        const raw = JSON.parse((0, fs_1.readFileSync)(configPath, 'utf-8'));
        validateConfig(mergeConfig(raw));
        return mergeConfig(raw);
    }
    const { createJiti } = await Promise.resolve().then(() => __importStar(require('jiti')));
    const jiti = createJiti(cwd, { interopDefault: true });
    const loaded = jiti(configPath);
    const config = 'default' in loaded && loaded.default ? loaded.default : loaded;
    validateConfig(config);
    return mergeConfig(config);
}
function validateConfig(config) {
    if (!config.baseUrl) {
        throw new Error('Config error: baseUrl is required');
    }
    if (!config.routes?.length) {
        throw new Error('Config error: at least one route is required');
    }
    if (!['2.1', '2.2'].includes(config.wcag?.version)) {
        throw new Error('Config error: wcag.version must be "2.1" or "2.2"');
    }
    if (!['A', 'AA', 'AAA'].includes(config.wcag?.level)) {
        throw new Error('Config error: wcag.level must be "A", "AA", or "AAA"');
    }
}
function evaluateThresholds(report, config) {
    const failOn = new Set(config.thresholds?.failOn ?? ['critical', 'serious']);
    const maxViolations = config.thresholds?.maxViolations ?? 0;
    const violations = report.findings.filter((f) => !f.needsManualReview);
    const failing = violations.filter((f) => failOn.has(f.impact));
    if (failing.length > maxViolations) {
        return false;
    }
    return true;
}
exports.DEFAULT_VARIANTS = ['default', 'dark', 'zoom-200'];
//# sourceMappingURL=config.js.map
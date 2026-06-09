"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWaivers = loadWaivers;
exports.applyWaivers = applyWaivers;
exports.getActiveWaivers = getActiveWaivers;
exports.getExpiredWaivers = getExpiredWaivers;
const fs_1 = require("fs");
const path_1 = require("path");
const DEFAULT_WAIVERS_FILE = 'a11y-waivers.json';
function loadWaivers(cwd, config) {
    const file = config.waivers?.file ?? DEFAULT_WAIVERS_FILE;
    const path = (0, path_1.resolve)(cwd, file);
    if (!(0, fs_1.existsSync)(path)) {
        return [];
    }
    const raw = JSON.parse((0, fs_1.readFileSync)(path, 'utf-8'));
    if (!Array.isArray(raw.waivers)) {
        throw new Error(`Invalid waivers file ${path}: expected { "waivers": [] }`);
    }
    return raw.waivers;
}
function isWaiverActive(waiver, referenceDate = new Date()) {
    const expires = new Date(waiver.expires);
    return !Number.isNaN(expires.getTime()) && expires >= referenceDate;
}
function matchesWaiver(finding, waiver) {
    if (waiver.rule && finding.rule !== waiver.rule) {
        return false;
    }
    if (waiver.criteria?.length) {
        const hasOverlap = waiver.criteria.some((c) => finding.wcag.criteria.includes(c));
        if (!hasOverlap) {
            return false;
        }
    }
    if (waiver.route && finding.route !== waiver.route) {
        return false;
    }
    if (waiver.selector && !finding.selector.includes(waiver.selector)) {
        return false;
    }
    return true;
}
function applyWaivers(findings, waivers) {
    const activeWaivers = waivers.filter((w) => isWaiverActive(w));
    return findings.map((finding) => {
        const match = activeWaivers.find((w) => matchesWaiver(finding, w));
        if (!match) {
            return finding;
        }
        return {
            ...finding,
            waived: true,
            waiverId: match.id,
            waiverReason: match.reason,
        };
    });
}
function getActiveWaivers(waivers) {
    return waivers.filter((w) => isWaiverActive(w));
}
function getExpiredWaivers(waivers) {
    return waivers.filter((w) => !isWaiverActive(w));
}
//# sourceMappingURL=waivers.js.map
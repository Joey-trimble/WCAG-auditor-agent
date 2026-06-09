"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSarifReport = buildSarifReport;
exports.writeSarifReport = writeSarifReport;
const fs_1 = require("fs");
const path_1 = require("path");
function impactToLevel(impact) {
    switch (impact) {
        case 'critical':
        case 'serious':
            return 'error';
        case 'moderate':
            return 'warning';
        case 'minor':
            return 'note';
        default:
            return 'warning';
    }
}
function buildRuleDescriptor(finding) {
    const criterion = finding.wcag.criteria.find((c) => c !== 'unknown') ?? finding.wcag.criteria[0];
    return {
        id: finding.rule,
        name: finding.rule,
        shortDescription: { text: finding.summary },
        fullDescription: { text: finding.description },
        helpUri: finding.w3c?.understanding ?? finding.helpUrl,
        properties: {
            wcag: criterion,
            wcagLevel: finding.wcag.level,
            source: finding.source,
        },
    };
}
function buildSarifReport(report) {
    const actionable = report.findings.filter((f) => !f.needsManualReview);
    const rules = new Map();
    for (const finding of actionable) {
        if (!rules.has(finding.rule)) {
            rules.set(finding.rule, buildRuleDescriptor(finding));
        }
    }
    const results = actionable.map((finding) => {
        const result = {
            ruleId: finding.rule,
            level: impactToLevel(finding.impact),
            message: { text: `${finding.summary} — ${finding.description}` },
            locations: [
                {
                    physicalLocation: {
                        artifactLocation: {
                            uri: finding.route,
                            uriBaseId: 'WEB_ROOT',
                        },
                        region: {
                            startLine: 1,
                            snippet: { text: finding.selector },
                        },
                    },
                },
            ],
            properties: {
                wcag: finding.wcag.criteria,
                impact: finding.impact,
                selector: finding.selector,
                route: finding.route,
                variant: finding.variant,
                source: finding.source,
                waived: finding.waived ?? false,
            },
        };
        if (finding.waived && finding.waiverReason) {
            result.suppressions = [
                {
                    kind: 'external',
                    justification: `${finding.waiverId}: ${finding.waiverReason}`,
                },
            ];
        }
        return result;
    });
    return {
        version: '2.1.0',
        $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
        runs: [
            {
                tool: {
                    driver: {
                        name: report.meta.tool,
                        version: report.meta.version,
                        informationUri: 'https://github.com/Joey-trimble/WCAG-auditor-agent',
                        rules: [...rules.values()],
                    },
                },
                invocations: [
                    {
                        executionSuccessful: true,
                        endTimeUtc: report.meta.timestamp,
                    },
                ],
                results,
                properties: {
                    wcagVersion: report.meta.wcag.version,
                    wcagLevel: report.meta.wcag.level,
                    baseUrl: report.meta.baseUrl,
                    passed: report.summary.passed,
                    violations: report.summary.violations,
                    waived: report.summary.waived ?? 0,
                },
            },
        ],
    };
}
function writeSarifReport(report, outputPath) {
    const sarif = buildSarifReport(report);
    (0, fs_1.mkdirSync)((0, path_1.dirname)(outputPath), { recursive: true });
    (0, fs_1.writeFileSync)(outputPath, JSON.stringify(sarif, null, 2), 'utf-8');
}
//# sourceMappingURL=sarif.js.map
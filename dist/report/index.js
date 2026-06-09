"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWcagContext = exports.writeWcagContext = exports.buildSarifReport = exports.writeSarifReport = exports.generateAgentReviewBrief = exports.writeAgentReviewBrief = exports.writeHtmlReport = exports.writeJsonReport = void 0;
exports.writeReports = writeReports;
const path_1 = require("path");
const json_1 = require("./json");
const html_1 = require("./html");
const review_1 = require("./review");
const sarif_1 = require("./sarif");
const context_1 = require("./context");
async function writeReports(report, config, cwd) {
    const outputDir = (0, path_1.resolve)(cwd, config.output?.dir ?? './a11y-reports');
    const formats = config.output?.formats ?? ['json', 'html'];
    const written = [];
    if (formats.includes('json')) {
        const jsonPath = (0, path_1.resolve)(outputDir, 'report.json');
        (0, json_1.writeJsonReport)(report, jsonPath);
        written.push(jsonPath);
    }
    if (formats.includes('html')) {
        const htmlPath = (0, path_1.resolve)(outputDir, 'report.html');
        (0, html_1.writeHtmlReport)(report, htmlPath);
        written.push(htmlPath);
    }
    if (formats.includes('sarif')) {
        const sarifPath = (0, path_1.resolve)(outputDir, 'report.sarif');
        (0, sarif_1.writeSarifReport)(report, sarifPath);
        written.push(sarifPath);
    }
    const reviewPath = (0, path_1.resolve)(outputDir, 'agent-review.md');
    (0, review_1.writeAgentReviewBrief)(report, reviewPath);
    written.push(reviewPath);
    const contextPath = (0, path_1.resolve)(outputDir, 'wcag-context.json');
    (0, context_1.writeWcagContext)(report, contextPath);
    written.push(contextPath);
    return written;
}
var json_2 = require("./json");
Object.defineProperty(exports, "writeJsonReport", { enumerable: true, get: function () { return json_2.writeJsonReport; } });
var html_2 = require("./html");
Object.defineProperty(exports, "writeHtmlReport", { enumerable: true, get: function () { return html_2.writeHtmlReport; } });
var review_2 = require("./review");
Object.defineProperty(exports, "writeAgentReviewBrief", { enumerable: true, get: function () { return review_2.writeAgentReviewBrief; } });
var review_brief_1 = require("../agent/review-brief");
Object.defineProperty(exports, "generateAgentReviewBrief", { enumerable: true, get: function () { return review_brief_1.generateAgentReviewBrief; } });
var sarif_2 = require("./sarif");
Object.defineProperty(exports, "writeSarifReport", { enumerable: true, get: function () { return sarif_2.writeSarifReport; } });
Object.defineProperty(exports, "buildSarifReport", { enumerable: true, get: function () { return sarif_2.buildSarifReport; } });
var context_2 = require("./context");
Object.defineProperty(exports, "writeWcagContext", { enumerable: true, get: function () { return context_2.writeWcagContext; } });
var context_3 = require("../wcag/context");
Object.defineProperty(exports, "buildWcagContext", { enumerable: true, get: function () { return context_3.buildWcagContext; } });
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeHtmlReport = exports.writeJsonReport = void 0;
exports.writeReports = writeReports;
const path_1 = require("path");
const json_1 = require("./json");
const html_1 = require("./html");
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
    return written;
}
var json_2 = require("./json");
Object.defineProperty(exports, "writeJsonReport", { enumerable: true, get: function () { return json_2.writeJsonReport; } });
var html_2 = require("./html");
Object.defineProperty(exports, "writeHtmlReport", { enumerable: true, get: function () { return html_2.writeHtmlReport; } });
//# sourceMappingURL=index.js.map
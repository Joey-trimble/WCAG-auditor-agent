"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJsonReport = writeJsonReport;
const fs_1 = require("fs");
const path_1 = require("path");
function writeJsonReport(report, outputPath) {
    (0, fs_1.mkdirSync)((0, path_1.dirname)(outputPath), { recursive: true });
    (0, fs_1.writeFileSync)(outputPath, JSON.stringify(report, null, 2), 'utf-8');
}
//# sourceMappingURL=json.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeWcagContext = writeWcagContext;
const fs_1 = require("fs");
const path_1 = require("path");
const context_1 = require("../wcag/context");
function writeWcagContext(report, outputPath) {
    const context = (0, context_1.buildWcagContext)(report);
    (0, fs_1.mkdirSync)((0, path_1.dirname)(outputPath), { recursive: true });
    (0, fs_1.writeFileSync)(outputPath, JSON.stringify(context, null, 2), 'utf-8');
}
//# sourceMappingURL=context.js.map
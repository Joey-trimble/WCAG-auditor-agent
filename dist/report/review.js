"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAgentReviewBrief = writeAgentReviewBrief;
const fs_1 = require("fs");
const path_1 = require("path");
const review_brief_1 = require("../agent/review-brief");
function writeAgentReviewBrief(report, outputPath) {
    const markdown = (0, review_brief_1.generateAgentReviewBrief)(report);
    (0, fs_1.mkdirSync)((0, path_1.dirname)(outputPath), { recursive: true });
    (0, fs_1.writeFileSync)(outputPath, markdown, 'utf-8');
}
//# sourceMappingURL=review.js.map
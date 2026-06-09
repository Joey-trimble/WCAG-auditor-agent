"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeHtmlReport = exports.writeJsonReport = exports.writeReports = exports.findConfigPath = exports.evaluateThresholds = exports.getWcagTags = exports.mergeConfig = exports.loadConfig = exports.auditUrl = exports.audit = void 0;
var audit_1 = require("./audit");
Object.defineProperty(exports, "audit", { enumerable: true, get: function () { return audit_1.audit; } });
Object.defineProperty(exports, "auditUrl", { enumerable: true, get: function () { return audit_1.auditUrl; } });
var config_1 = require("./config");
Object.defineProperty(exports, "loadConfig", { enumerable: true, get: function () { return config_1.loadConfig; } });
Object.defineProperty(exports, "mergeConfig", { enumerable: true, get: function () { return config_1.mergeConfig; } });
Object.defineProperty(exports, "getWcagTags", { enumerable: true, get: function () { return config_1.getWcagTags; } });
Object.defineProperty(exports, "evaluateThresholds", { enumerable: true, get: function () { return config_1.evaluateThresholds; } });
Object.defineProperty(exports, "findConfigPath", { enumerable: true, get: function () { return config_1.findConfigPath; } });
var report_1 = require("./report");
Object.defineProperty(exports, "writeReports", { enumerable: true, get: function () { return report_1.writeReports; } });
Object.defineProperty(exports, "writeJsonReport", { enumerable: true, get: function () { return report_1.writeJsonReport; } });
Object.defineProperty(exports, "writeHtmlReport", { enumerable: true, get: function () { return report_1.writeHtmlReport; } });
//# sourceMappingURL=index.js.map
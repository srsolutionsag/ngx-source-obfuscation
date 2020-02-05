"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const architect_1 = require("@angular-devkit/architect");
const fs_1 = require("fs");
const javascript_obfuscator_1 = require("javascript-obfuscator");
const path_1 = require("path");
const readdirp_1 = require("readdirp");
const util_1 = require("util");
const multi_stage_sourcemap_1 = require("multi-stage-sourcemap");
const preadFile = util_1.promisify(fs_1.readFile);
const pwriteFile = util_1.promisify(fs_1.writeFile);
const pmkdir = util_1.promisify(fs_1.mkdir);
const processedFiles = new Set();
function _commandBuilder(options, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            context.reportStatus("Obfuscate angular application.");
            yield Promise.all(options.files.map((it) => obfuscateJsFiles(context, options, it)));
            context.logger.info(`Obfuscation finished.`);
            return { success: true };
        }
        catch (e) {
            if (typeof e === "string") {
                context.reportStatus(`File obfuscation failed with error '${e}'.`);
                return { success: false, error: e };
            }
            if (e.message !== undefined && typeof e.message === "string") {
                context.reportStatus(`File obfuscation failed with error '${e.message}'.`);
                return { success: false, error: e.message };
            }
        }
        finally {
            processedFiles.clear();
        }
    });
}
function obfuscateJsFiles(context, options, files) {
    var e_1, _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const inputPath = path_1.join(context.currentDirectory, files.input);
        const outputPath = path_1.join(context.currentDirectory, files.output);
        try {
            for (var _b = tslib_1.__asyncValues(readdirp_1.default(inputPath, { fileFilter: files.glob, type: "files", depth: 30 })), _c; _c = yield _b.next(), !_c.done;) {
                const item = _c.value;
                if (processedFiles.has(item.fullPath)) {
                    continue;
                }
                context.logger.info(`Obfuscate: ${item.fullPath}`);
                const result = javascript_obfuscator_1.obfuscate((yield preadFile(item.fullPath)).toString(), options);
                const jobs = new Array(2);
                const sourceMapFile = `${item.fullPath}.map`;
                if (options.sourceMap && options.sourceMapMode === "separate") {
                    // example https://gist.github.com/markuszm/a76ec4ed2d8cf912b504b731dd60f996
                    try {
                        context.logger.debug(`Transfer source map: ${sourceMapFile}`);
                        const bMap = (yield preadFile(sourceMapFile)).toString();
                        const cToAMap = multi_stage_sourcemap_1.transfer({ fromSourceMap: result.getSourceMap(), toSourceMap: bMap });
                        jobs.push(pwriteFile(sourceMapFile, cToAMap));
                    }
                    catch (e) {
                        context.logger.warn(`Encountered error with message: ${e.message}`);
                        context.logger.warn("Unable to find or process typescript -> js source map failed to transfer source map, fallback to obfuscation source map.");
                        jobs.push(pwriteFile(sourceMapFile, result.getSourceMap()));
                    }
                }
                const fullOutputPath = path_1.normalize(item.fullPath.replace(inputPath, outputPath));
                const parentDir = path_1.dirname(fullOutputPath);
                yield pmkdir(parentDir, { recursive: true });
                jobs.push(pwriteFile(fullOutputPath, result.getObfuscatedCode()));
                yield Promise.all(jobs);
                processedFiles.add(item.fullPath);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
exports.default = architect_1.createBuilder(_commandBuilder);
//# sourceMappingURL=index.js.map
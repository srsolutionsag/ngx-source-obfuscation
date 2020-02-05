import { BuilderContext, BuilderOutput, createBuilder } from "@angular-devkit/architect";
import { JsonObject, workspaces } from "@angular-devkit/core";
import { NodeJsSyncHost } from "@angular-devkit/core/node";
import { mkdir, readFile, writeFile } from "fs";
import { obfuscate, ObfuscatedCode } from "javascript-obfuscator";
import { dirname, join, normalize } from "path";
import readdir from "readdirp";
import { promisify } from "util";
import { JsFiles, ObfuscateCommandOptions } from "./options";
import { transfer } from "multi-stage-sourcemap";


const preadFile = promisify(readFile);
const pwriteFile = promisify(writeFile);
const pmkdir = promisify(mkdir);

const processedFiles: Set<string> = new Set<string>();

async function _commandBuilder(options: ObfuscateCommandOptions & JsonObject, context: BuilderContext): Promise<BuilderOutput> {
    try {
        context.reportStatus("Obfuscate angular application.");
        await Promise.all(options.files.map((it) => obfuscateJsFiles(context, options, it)));
        context.logger.info(`Obfuscation finished.`);
        return {success: true};

    } catch
        (e) {
        if (typeof e === "string") {
            context.reportStatus(`File obfuscation failed with error '${e}'.`);
            return {success: false, error: e};
        }

        if (e.message !== undefined && typeof e.message === "string") {
            context.reportStatus(`File obfuscation failed with error '${e.message}'.`);
            return {success: false, error: e.message};
        }
    } finally {
        processedFiles.clear();
    }
}

async function obfuscateJsFiles(context: BuilderContext, options: ObfuscateCommandOptions & JsonObject, files: JsFiles): Promise<void> {
    const inputPath: string = join(context.currentDirectory, files.input);
    const outputPath: string = join(context.currentDirectory, (await getBuildPath(context)), files.output);
    for await (const item of readdir(inputPath, {fileFilter: files.glob, type: "files", depth: 30})) {
        if (processedFiles.has(item.fullPath)) {
            continue;
        }
        context.logger.info(`Obfuscate: ${item.fullPath}`);
        const result: ObfuscatedCode = obfuscate((await preadFile(item.fullPath)).toString(), options);
        const jobs: Array<Promise<void>> = new Array<Promise<void>>(2);
        const sourceMapFile = `${item.fullPath}.map`;
        if (options.sourceMap && options.sourceMapMode === "separate") {
            // example https://gist.github.com/markuszm/a76ec4ed2d8cf912b504b731dd60f996
            try {
                context.logger.debug(`Transfer source map: ${sourceMapFile}`);
                const bMap: string = (await preadFile(sourceMapFile)).toString();
                const cToAMap: string = transfer({fromSourceMap: result.getSourceMap(), toSourceMap: bMap});
                jobs.push(pwriteFile(sourceMapFile, cToAMap));
            } catch (e) {
                context.logger.warn(`Encountered error with message: ${e.message}`);
                context.logger.warn("Unable to find or process typescript -> js source map failed to transfer source map, fallback to obfuscation source map.");
                jobs.push(pwriteFile(sourceMapFile, result.getSourceMap()));
            }
        }
        const fullOutputPath: string = normalize(item.fullPath.replace(inputPath, outputPath));
        const parentDir: string = dirname(fullOutputPath);
        await pmkdir(parentDir, {recursive: true});
        jobs.push(pwriteFile(fullOutputPath, result.getObfuscatedCode()));
        await Promise.all(jobs);
        processedFiles.add(item.fullPath);
    }
}

async function getBuildPath(context: BuilderContext): Promise<string> {
    const host = workspaces.createWorkspaceHost(new NodeJsSyncHost());
    const workspace = await workspaces.readWorkspace(context.currentDirectory, host);

    const project = workspace.workspace.projects.get(context.target.project);
    if (!project) {
        throw new Error(`${context.target.project} not found.`);
    }

    const buildTarget = project.targets.get("build");
    if (!buildTarget) {
        throw new Error("Build target does not exist!");
    }

    const outputBasePath: unknown = buildTarget.configurations?.production?.outputPath ?? buildTarget.options?.outputPath;
    if (typeof outputBasePath !== "string") {
        throw new Error("Build target has no build directory configured!");
    }

    return outputBasePath;
}

export default createBuilder(_commandBuilder);

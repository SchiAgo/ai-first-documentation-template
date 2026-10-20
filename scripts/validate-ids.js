const fs = require("fs");
const path = require("path");

const {
    getMarkdownFiles
} = require("./utils/file-utils");

const {
    ID_TYPES,
    ID_PLACEHOLDERS
} = require("./utils/constants");

const ID_TYPE_PATTERN = ID_TYPES.join("|");
const PLACEHOLDERS = new Set(ID_PLACEHOLDERS);
const DEFINITION_FILES = {
    FR: ["docs/01-prd/PRD.md"],
    NFR: ["docs/01-prd/PRD.md"],
    FLOW: ["docs/03-application-flows/APPLICATION-FLOWS.md"],
    ENT: ["docs/05-data-architecture/DATA-ARCHITECTURE.md"],
    API: ["docs/02-trd/TRD.md"],
    UI: ["docs/04-design-system/DESIGN-SYSTEM.md"],
    EPIC: ["docs/06-implementation-plan/IMPLEMENTATION-PLAN.md"],
    TASK: ["docs/06-implementation-plan/IMPLEMENTATION-PLAN.md"],
    ADR: ["docs/07-adr"]
};

function getContentLines(content) {
    const result = [];
    let fenceCharacter = null;
    let fenceLength = 0;

    for (const [index, line] of content.split(/\r?\n/).entries()) {
        const fence = line.match(/^\s{0,3}(`{3,}|~{3,})/);

        if (fence) {
            const marker = fence[1];

            if (fenceCharacter === null) {
                fenceCharacter = marker[0];
                fenceLength = marker.length;
            } else if (
                marker[0] === fenceCharacter &&
                marker.length >= fenceLength
            ) {
                fenceCharacter = null;
                fenceLength = 0;
            }

            continue;
        }

        if (fenceCharacter === null) {
            result.push({ line, lineNumber: index + 1 });
        }
    }

    return result;
}

function findInvalidIds(content, file) {
    const issues = [];
    const idPattern = new RegExp(
        `\\b(${ID_TYPE_PATTERN})([-_])([A-Za-z0-9]*)(?![A-Za-z0-9])`,
        "gi"
    );

    for (const { line, lineNumber } of getContentLines(content)) {
        for (const match of line.matchAll(idPattern)) {
            const [, prefix, separator, suffix] = match;
            const id = `${prefix}${separator}${suffix}`;
            const isPlaceholder = PLACEHOLDERS.has(suffix.toUpperCase());
            const isValid =
                prefix === prefix.toUpperCase() &&
                separator === "-" &&
                /^\d{3}$/.test(suffix) &&
                suffix !== "000";

            if (!isValid && !isPlaceholder) {
                issues.push({
                    file,
                    lineNumber,
                    id,
                    message: "formato non valido; usare PREFIX-NNN con NNN da 001 a 999"
                });
            }
        }
    }

    return issues;
}

function extractDefinitions(content, file) {
    const definitions = [];
    const headingPattern = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
    const idPattern = new RegExp(
        `^(${ID_TYPE_PATTERN})-([A-Za-z0-9]+)(?=$|\\s|[:–—])`,
        "i"
    );

    for (const { line, lineNumber } of getContentLines(content)) {
        const heading = line.match(headingPattern);

        if (!heading) {
            continue;
        }

        const idMatch = heading[2].trim().match(idPattern);

        if (
            !idMatch ||
            !/^\d{3}$/.test(idMatch[2]) ||
            idMatch[2] === "000"
        ) {
            continue;
        }

        definitions.push({
            id: `${idMatch[1].toUpperCase()}-${idMatch[2]}`,
            file,
            lineNumber
        });
    }

    return definitions;
}

function findDuplicateDefinitions(definitions) {
    const seen = new Map();
    const duplicates = [];

    for (const definition of definitions) {
        const previous = seen.get(definition.id);

        if (previous) {
            duplicates.push({
                id: definition.id,
                first: previous,
                duplicate: definition
            });
        } else {
            seen.set(definition.id, definition);
        }
    }

    return duplicates;
}

function getDefinitionFiles(rootDirectory, relativePaths) {
    return relativePaths.flatMap(relativePath => {
        const absolutePath = path.join(rootDirectory, relativePath);

        if (!fs.existsSync(absolutePath)) {
            return [];
        }

        if (fs.statSync(absolutePath).isDirectory()) {
            return getMarkdownFiles(absolutePath)
                .filter(file => path.basename(file) !== "ADR-TEMPLATE.md");
        }

        return [absolutePath];
    });
}

function loadDefinitions(rootDirectory, idTypes = Object.keys(DEFINITION_FILES)) {
    const files = new Set();

    for (const idType of idTypes) {
        const relativePaths = DEFINITION_FILES[idType] || [];

        for (const file of getDefinitionFiles(rootDirectory, relativePaths)) {
            files.add(file);
        }
    }

    return [...files].flatMap(file => {
        const content = fs.readFileSync(file, "utf8");
        return extractDefinitions(
            content,
            path.relative(rootDirectory, file)
        );
    });
}

function runValidation() {
    const rootDirectory = path.resolve(__dirname, "..");
    const markdownFiles = getMarkdownFiles(
        path.join(rootDirectory, "docs")
    );
    const formattingIssues = [];

    for (const file of markdownFiles) {
        const content = fs.readFileSync(file, "utf8");
        const relativeFile = path.relative(rootDirectory, file);
        formattingIssues.push(...findInvalidIds(content, relativeFile));
    }

    for (const [idType, relativePaths] of Object.entries(DEFINITION_FILES)) {
        if (
            relativePaths.every(relativePath =>
                !fs.existsSync(path.join(rootDirectory, relativePath))
            )
        ) {
            formattingIssues.push({
                file: relativePaths.join(", "),
                lineNumber: 0,
                id: idType,
                message: "documento proprietario dell'identificativo mancante"
            });
        }

    }

    const definitions = loadDefinitions(rootDirectory);
    const duplicateDefinitions = findDuplicateDefinitions(definitions);

    for (const issue of formattingIssues) {
        const line = issue.lineNumber ? `:${issue.lineNumber}` : "";
        console.error(
            `❌ ${issue.file}${line} -> "${issue.id}": ${issue.message}`
        );
    }

    for (const duplicate of duplicateDefinitions) {
        console.error(
            `❌ ID duplicato "${duplicate.id}": ` +
            `${duplicate.first.file}:${duplicate.first.lineNumber} e ` +
            `${duplicate.duplicate.file}:${duplicate.duplicate.lineNumber}`
        );
    }

    if (formattingIssues.length > 0 || duplicateDefinitions.length > 0) {
        console.error("\n❌ ID validation FAILED");
        process.exitCode = 1;
        return;
    }

    console.log(
        `✅ Formato ID valido; nessuna definizione duplicata (${definitions.length} ID definiti)`
    );
}

if (require.main === module) {
    runValidation();
}

module.exports = {
    extractDefinitions,
    findDuplicateDefinitions,
    findInvalidIds,
    getContentLines,
    getDefinitionFiles,
    loadDefinitions,
    DEFINITION_FILES
};

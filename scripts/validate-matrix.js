const fs = require("fs");
const path = require("path");

const {
    extractDefinitions
} = require("./validate-ids");
const {
    getMarkdownFiles
} = require("./utils/file-utils");

const MATRIX_FILE = path.join(
    "docs",
    "09-traceability",
    "REQUIREMENTS-TRACEABILITY-MATRIX.md"
);
const COLUMNS = ["FR", "FLOW", "ENT", "API", "UI", "EPIC", "TASK", "ADR"];
const REQUIRED_COLUMNS = new Set(COLUMNS.filter(column => column !== "ADR"));
const PLACEHOLDER_SUFFIXES = new Set(["ID", "XXX", "YYY", "NNN"]);
const DEFINITION_FILES = {
    FR: ["docs/01-prd/PRD.md"],
    FLOW: ["docs/03-application-flows/APPLICATION-FLOWS.md"],
    ENT: ["docs/05-data-architecture/DATA-ARCHITECTURE.md"],
    API: ["docs/02-trd/TRD.md"],
    UI: ["docs/04-design-system/DESIGN-SYSTEM.md"],
    EPIC: ["docs/06-implementation-plan/IMPLEMENTATION-PLAN.md"],
    TASK: ["docs/06-implementation-plan/IMPLEMENTATION-PLAN.md"],
    ADR: ["docs/07-adr"]
};

function parseTableCells(line) {
    const trimmed = line.trim();

    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
        return null;
    }

    return trimmed
        .slice(1, -1)
        .split("|")
        .map(cell => cell.trim());
}

function isSeparatorRow(cells) {
    return cells !== null &&
        cells.length > 0 &&
        cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

function findMatrixTable(content) {
    const lines = content.split(/\r?\n/);
    const matchingTables = [];

    for (let index = 0; index < lines.length - 1; index += 1) {
        const header = parseTableCells(lines[index]);
        const separator = parseTableCells(lines[index + 1]);

        if (!header || !isSeparatorRow(separator)) {
            continue;
        }

        matchingTables.push({
            header,
            separator,
            separatorLine: index + 2,
            rows: [],
            lineNumber: index + 1
        });
    }

    const candidate = matchingTables.find(table =>
        table.header.some(cell => COLUMNS.includes(cell))
    );

    if (!candidate) {
        return {
            table: null,
            errors: ["Traceability Matrix: tabella Markdown non trovata"]
        };
    }

    if (matchingTables.filter(table =>
        table.header.some(cell => COLUMNS.includes(cell))
    ).length !== 1) {
        return {
            table: null,
            errors: ["Traceability Matrix: trovate più tabelle che sembrano matrici"]
        };
    }

    if (
        candidate.header.length !== COLUMNS.length ||
        candidate.header.some((column, index) => column !== COLUMNS[index])
    ) {
        return {
            table: candidate,
            errors: [
                `Traceability Matrix riga ${candidate.lineNumber}: intestazioni attese ` +
                `${COLUMNS.join(" | ")}`
            ]
        };
    }

    if (candidate.separator.length !== candidate.header.length) {
        return {
            table: candidate,
            errors: [
                `Traceability Matrix riga ${candidate.separatorLine}: il separatore deve avere ${candidate.header.length} celle`
            ]
        };
    }

    let rowIndex = candidate.separatorLine;

    while (rowIndex < lines.length) {
        const cells = parseTableCells(lines[rowIndex]);

        if (!cells) {
            break;
        }

        if (isSeparatorRow(cells)) {
            rowIndex += 1;
            continue;
        }

        candidate.rows.push({
            cells,
            lineNumber: rowIndex + 1
        });
        rowIndex += 1;
    }

    return { table: candidate, errors: [] };
}

function isPlaceholderId(value, column) {
    const match = value.match(/^([A-Z]+)-(ID|XXX|YYY|NNN)$/);
    return Boolean(
        match &&
        match[1] === column &&
        PLACEHOLDER_SUFFIXES.has(match[2])
    );
}

function loadDefinitions(rootDirectory) {
    const definitions = new Map(COLUMNS.map(column => [column, new Set()]));

    for (const [column, relativePaths] of Object.entries(DEFINITION_FILES)) {
        const files = relativePaths.flatMap(relativePath => {
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

        for (const file of files) {
            const content = fs.readFileSync(file, "utf8");
            for (const definition of extractDefinitions(content, file)) {
                if (definitions.has(definition.id.split("-")[0])) {
                    definitions.get(definition.id.split("-")[0]).add(definition.id);
                }
            }
        }
    }

    return definitions;
}

function validateMatrix(rootDirectory) {
    const matrixPath = path.join(rootDirectory, MATRIX_FILE);

    if (!fs.existsSync(matrixPath)) {
        return {
            errors: [`Traceability Matrix mancante: ${MATRIX_FILE}`],
            rowCount: 0
        };
    }

    const content = fs.readFileSync(matrixPath, "utf8");

    if (!content.trim()) {
        return {
            errors: [`Traceability Matrix vuota: ${MATRIX_FILE}`],
            rowCount: 0
        };
    }

    const { table, errors } = findMatrixTable(content);

    if (!table || errors.length > 0) {
        return { errors, rowCount: table?.rows.length ?? 0 };
    }

    const definitions = loadDefinitions(rootDirectory);
    const seenRows = new Map();
    let hasDataRow = false;

    for (const row of table.rows) {
        hasDataRow = true;

        if (row.cells.length !== COLUMNS.length) {
            errors.push(
                `Traceability Matrix riga ${row.lineNumber}: attese ${COLUMNS.length} celle, trovate ${row.cells.length}`
            );
            continue;
        }

        const rowKey = row.cells.join("|");
        if (seenRows.has(rowKey)) {
            errors.push(
                `Traceability Matrix riga duplicata ${row.lineNumber} (già presente alla riga ${seenRows.get(rowKey)})`
            );
        } else {
            seenRows.set(rowKey, row.lineNumber);
        }

        for (const [index, column] of COLUMNS.entries()) {
            const value = row.cells[index];

            if (!value && REQUIRED_COLUMNS.has(column)) {
                errors.push(
                    `Traceability Matrix riga ${row.lineNumber}: cella obbligatoria ${column} vuota`
                );
                continue;
            }

            if (!value) {
                continue;
            }

            if (isPlaceholderId(value, column)) {
                continue;
            }

            const validId = new RegExp(`^${column}-\\d{3}$`);
            if (!validId.test(value) || value.endsWith("-000")) {
                errors.push(
                    `Traceability Matrix riga ${row.lineNumber}: "${value}" non è un ID valido per la colonna ${column}`
                );
                continue;
            }

            if (!definitions.get(column).has(value)) {
                errors.push(
                    `Traceability Matrix riga ${row.lineNumber}: ${value} non è definito nel documento proprietario`
                );
            }
        }
    }

    if (!hasDataRow) {
        errors.push("Traceability Matrix: nessuna riga dati trovata");
    }

    return {
        errors,
        rowCount: table.rows.length
    };
}

function runValidation() {
    const rootDirectory = path.resolve(__dirname, "..");
    const result = validateMatrix(rootDirectory);

    if (result.errors.length > 0) {
        for (const error of result.errors) {
            console.error(`❌ ${error}`);
        }

        console.error("\n❌ Matrix validation FAILED");
        process.exitCode = 1;
        return;
    }

    console.log(
        `✅ Traceability Matrix valida (${result.rowCount} righe)`
    );
    console.log("\n✅ Matrix validation PASSED");
}

if (require.main === module) {
    runValidation();
}

module.exports = {
    findMatrixTable,
    isPlaceholderId,
    validateMatrix
};

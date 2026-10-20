const fs = require("fs");
const path = require("path");

const {
    DEFINITION_FILES,
    getDefinitionFiles,
    extractDefinitions
} = require("./validate-ids");

const MATRIX_FILE = path.join(
    "docs",
    "09-traceability",
    "REQUIREMENTS-TRACEABILITY-MATRIX.md"
);
const COLUMNS = ["FR", "FLOW", "ENT", "API", "UI", "EPIC", "TASK", "ADR"];
const REQUIRED_COLUMNS = new Set(COLUMNS.filter(column => column !== "ADR"));
const PLACEHOLDER_SUFFIXES = new Set(["ID", "XXX", "YYY", "NNN"]);
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
    const lines = [];
    let fenceCharacter = null;
    let fenceLength = 0;

    for (const line of content.split(/\r?\n/)) {
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

            lines.push(null);
            continue;
        }

        lines.push(fenceCharacter === null ? line : null);
    }

    const matchingTables = [];

    for (let index = 0; index < lines.length - 1; index += 1) {
        if (lines[index] === null || lines[index + 1] === null) {
            continue;
        }

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
        if (lines[rowIndex] === null) {
            break;
        }

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
        const files = getDefinitionFiles(rootDirectory, relativePaths);

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

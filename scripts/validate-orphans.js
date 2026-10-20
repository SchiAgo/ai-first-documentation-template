const fs = require("fs");
const path = require("path");

const {
    DEFINITION_FILES,
    loadDefinitions
} = require("./validate-ids");
const {
    findMatrixTable,
    validateMatrix
} = require("./validate-matrix");

const MATRIX_FILE =
    "docs/09-traceability/REQUIREMENTS-TRACEABILITY-MATRIX.md";
const TRACKED_TYPES = [
    "FR",
    "FLOW",
    "ENT",
    "API",
    "UI",
    "EPIC",
    "TASK"
];

function getMatrixIdsByType(content) {
    const parsed = findMatrixTable(content);

    if (!parsed.table || parsed.errors.length > 0) {
        return {
            idsByType: null,
            errors: parsed.errors
        };
    }

    const idsByType = new Map(
        TRACKED_TYPES.map(type => [type, new Set()])
    );

    for (const row of parsed.table.rows) {
        for (const [index, type] of TRACKED_TYPES.entries()) {
            const id = row.cells[index];

            if (/^\d{3}$/.test(id.slice(type.length + 1))) {
                idsByType.get(type).add(id);
            }
        }
    }

    return { idsByType, errors: [] };
}

function findOrphanDefinitions(definitions, idsByType) {
    return definitions.filter(definition => {
        const type = definition.id.split("-")[0];
        return idsByType.has(type) &&
            !idsByType.get(type).has(definition.id);
    });
}

function validateOrphans(rootDirectory) {
    const missingDocuments = [];

    for (const type of TRACKED_TYPES) {
        const relativePaths = DEFINITION_FILES[type] || [];
        if (
            relativePaths.every(relativePath =>
                !fs.existsSync(path.join(rootDirectory, relativePath))
            )
        ) {
            missingDocuments.push(
                `Documento proprietario degli ID ${type} mancante`
            );
        }
    }

    if (missingDocuments.length > 0) {
        return {
            errors: missingDocuments,
            orphanIds: [],
            checkedCount: 0
        };
    }

    const matrixValidation = validateMatrix(rootDirectory);

    if (matrixValidation.errors.length > 0) {
        return {
            errors: [
                "Traceability Matrix non valida; controllo degli orfani non eseguito",
                ...matrixValidation.errors
            ],
            orphanIds: [],
            checkedCount: 0
        };
    }

    const matrixPath = path.join(rootDirectory, MATRIX_FILE);
    const matrixContent = fs.readFileSync(matrixPath, "utf8");
    const { idsByType, errors } = getMatrixIdsByType(matrixContent);

    if (!idsByType || errors.length > 0) {
        return {
            errors,
            orphanIds: [],
            checkedCount: 0
        };
    }

    const definitions = loadDefinitions(rootDirectory, TRACKED_TYPES);
    const trackedDefinitions = definitions.filter(definition =>
        TRACKED_TYPES.includes(definition.id.split("-")[0])
    );
    const orphanIds = findOrphanDefinitions(
        trackedDefinitions,
        idsByType
    );

    return {
        errors: orphanIds.map(orphan =>
            `ID orfano ${orphan.id} (${orphan.file}:${orphan.lineNumber})`
        ),
        orphanIds,
        checkedCount: trackedDefinitions.length
    };
}

function runValidation() {
    const rootDirectory = path.resolve(__dirname, "..");
    const result = validateOrphans(rootDirectory);

    if (result.errors.length > 0) {
        for (const error of result.errors) {
            console.error(`❌ ${error}`);
        }

        console.error("\n❌ Orphan validation FAILED");
        process.exitCode = 1;
        return;
    }

    console.log(
        `✅ Nessun elemento orfano (${result.checkedCount} ID verificati)`
    );
}

if (require.main === module) {
    runValidation();
}

module.exports = {
    findOrphanDefinitions,
    getMatrixIdsByType,
    validateOrphans
};

const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateMatrix
} = require("./validate-matrix");

const MATRIX_PATH = path.join(
    "docs",
    "09-traceability",
    "REQUIREMENTS-TRACEABILITY-MATRIX.md"
);
const HEADER = "| FR | FLOW | ENT | API | UI | EPIC | TASK | ADR |";
const SEPARATOR = "| --- | --- | --- | --- | --- | --- | --- | --- |";
const ROW = "| FR-001 | FLOW-001 | ENT-001 | API-001 | UI-001 | EPIC-001 | TASK-001 | ADR-XXX |";

function withRepository(run, matrixRows = [ROW]) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matrix-validator-"));

    try {
        const files = {
            "docs/01-prd/PRD.md": "# PRD\n\n### FR-001\n### NFR-001\n",
            "docs/02-trd/TRD.md": "# TRD\n\n#### API-001\n",
            "docs/03-application-flows/APPLICATION-FLOWS.md": "# Flows\n\n## FLOW-001\n",
            "docs/04-design-system/DESIGN-SYSTEM.md": "# Design\n\n### UI-001\n",
            "docs/05-data-architecture/DATA-ARCHITECTURE.md": "# Data\n\n## ENT-001\n",
            "docs/06-implementation-plan/IMPLEMENTATION-PLAN.md": "# Plan\n\n## EPIC-001\n## TASK-001\n## TASK-002\n",
            "docs/07-adr/ADR-TEMPLATE.md": "# ADR-XXX\n",
            [MATRIX_PATH]: [
                "# Traceability Matrix",
                "",
                HEADER,
                SEPARATOR,
                ...matrixRows,
                ""
            ].join("\n")
        };

        for (const [relativePath, content] of Object.entries(files)) {
            const filePath = path.join(root, relativePath);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, content);
        }

        run(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

test("accepts a complete matrix with an optional ADR placeholder", () => {
    withRepository(root => {
        assert.deepEqual(validateMatrix(root), {
            errors: [],
            rowCount: 1
        });
    });
});

test("accepts an empty optional ADR cell and repeated IDs across distinct rows", () => {
    const firstRow = "| FR-001 | FLOW-001 | ENT-001 | API-001 | UI-001 | EPIC-001 | TASK-001 |  |";
    const secondRow = "| FR-001 | FLOW-001 | ENT-001 | API-001 | UI-001 | EPIC-001 | TASK-002 |  |";

    withRepository(root => {
        assert.deepEqual(validateMatrix(root), {
            errors: [],
            rowCount: 2
        });
    }, [firstRow, secondRow]);
});

test("rejects an incorrect header or missing data rows", () => {
    withRepository(root => {
        const matrixPath = path.join(root, MATRIX_PATH);
        fs.writeFileSync(
            matrixPath,
            ["# Matrix", "", "| FR | FLOW | API |", SEPARATOR, ROW].join("\n")
        );

        assert.ok(validateMatrix(root).errors.some(error =>
            error.includes("intestazioni attese")
        ));

        fs.writeFileSync(
            matrixPath,
            ["# Matrix", "", HEADER, SEPARATOR].join("\n")
        );
        assert.deepEqual(validateMatrix(root).errors, [
            "Traceability Matrix: nessuna riga dati trovata"
        ]);
    });
});

test("rejects a separator row with a different number of columns", () => {
    withRepository(root => {
        fs.writeFileSync(
            path.join(root, MATRIX_PATH),
            [
                "# Matrix",
                "",
                HEADER,
                "| --- | --- | --- |",
                ROW
            ].join("\n")
        );

        assert.deepEqual(validateMatrix(root).errors, [
            "Traceability Matrix riga 4: il separatore deve avere 8 celle"
        ]);
    });
});

test("rejects malformed rows, missing required cells, wrong ID types, and unknown references", () => {
    const missingCellRow = "| FR-001 | FLOW-001 | ENT-001 | API-001 | UI-001 | EPIC-001 |  | ADR-XXX |";
    const wrongTypeRow = "| FR-001 | FR-001 | ENT-001 | API-001 | UI-001 | EPIC-001 | TASK-001 | ADR-XXX |";
    const unknownIdRow = "| FR-999 | FLOW-001 | ENT-001 | API-001 | UI-001 | EPIC-001 | TASK-001 | ADR-XXX |";
    const malformedRow = "| FR-001 | FLOW-001 | ENT-001 |";

    withRepository(root => {
        const errors = validateMatrix(root).errors;

        assert.ok(errors.some(error => error.includes("cella obbligatoria TASK vuota")));
        assert.ok(errors.some(error => error.includes("non è un ID valido per la colonna FLOW")));
        assert.ok(errors.some(error => error.includes("FR-999 non è definito")));
        assert.ok(errors.some(error => error.includes("attese 8 celle")));
    }, [missingCellRow, wrongTypeRow, unknownIdRow, malformedRow]);
});

test("rejects duplicate rows but permits shared IDs in different traceability paths", () => {
    withRepository(root => {
        const result = validateMatrix(root);
        assert.deepEqual(result.errors, [
            "Traceability Matrix riga duplicata 6 (già presente alla riga 5)"
        ]);
    }, [ROW, ROW]);
});

test("rejects a missing matrix file", () => {
    withRepository(root => {
        fs.rmSync(path.join(root, MATRIX_PATH));
        assert.deepEqual(validateMatrix(root).errors, [
            `Traceability Matrix mancante: ${MATRIX_PATH}`
        ]);
    });
});

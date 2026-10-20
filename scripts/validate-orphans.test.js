const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateOrphans
} = require("./validate-orphans");

const MATRIX_PATH =
    "docs/09-traceability/REQUIREMENTS-TRACEABILITY-MATRIX.md";
const HEADER = "| FR | FLOW | ENT | API | UI | EPIC | TASK | ADR |";
const SEPARATOR = "| --- | --- | --- | --- | --- | --- | --- | --- |";
const MATRIX_ROW = "| FR-001 | FLOW-001 | ENT-001 | API-001 | UI-001 | EPIC-001 | TASK-001 | ADR-XXX |";
const DEFINITION_FILES = {
    "docs/01-prd/PRD.md": "# PRD\n\n### FR-001\n### NFR-001\n",
    "docs/03-application-flows/APPLICATION-FLOWS.md": "# Flows\n\n## FLOW-001\n",
    "docs/05-data-architecture/DATA-ARCHITECTURE.md": "# Data\n\n## ENT-001\n",
    "docs/02-trd/TRD.md": "# TRD\n\n#### API-001\n",
    "docs/04-design-system/DESIGN-SYSTEM.md": "# Design\n\n### UI-001\n",
    "docs/06-implementation-plan/IMPLEMENTATION-PLAN.md": "# Plan\n\n## EPIC-001\n## TASK-001\n"
};

function withRepository(run, { row = MATRIX_ROW, extraFiles = {} } = {}) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "orphan-validator-"));

    try {
        const files = {
            ...DEFINITION_FILES,
            "docs/07-adr/ADR-TEMPLATE.md": "# ADR-XXX\n",
            [MATRIX_PATH]: [
                "# Requirements Traceability Matrix",
                "",
                HEADER,
                SEPARATOR,
                row,
                ""
            ].join("\n"),
            ...extraFiles
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

test("passes when all defined traceability IDs appear in their matrix columns", () => {
    withRepository(root => {
        assert.deepEqual(validateOrphans(root), {
            errors: [],
            orphanIds: [],
            checkedCount: 7
        });
    });
});

test("reports orphan IDs with source file and line for each tracked type", () => {
    const orphanHeadings = {
        "docs/01-prd/PRD.md": `${DEFINITION_FILES["docs/01-prd/PRD.md"]}\n### FR-002\n`,
        "docs/03-application-flows/APPLICATION-FLOWS.md": `${DEFINITION_FILES["docs/03-application-flows/APPLICATION-FLOWS.md"]}\n## FLOW-002\n`,
        "docs/05-data-architecture/DATA-ARCHITECTURE.md": `${DEFINITION_FILES["docs/05-data-architecture/DATA-ARCHITECTURE.md"]}\n## ENT-002\n`,
        "docs/02-trd/TRD.md": `${DEFINITION_FILES["docs/02-trd/TRD.md"]}\n#### API-002\n`,
        "docs/04-design-system/DESIGN-SYSTEM.md": `${DEFINITION_FILES["docs/04-design-system/DESIGN-SYSTEM.md"]}\n### UI-002\n`,
        "docs/06-implementation-plan/IMPLEMENTATION-PLAN.md": `${DEFINITION_FILES["docs/06-implementation-plan/IMPLEMENTATION-PLAN.md"]}\n## EPIC-002\n## TASK-002\n`
    };

    withRepository(root => {
        const result = validateOrphans(root);

        assert.deepEqual(
            result.orphanIds.map(orphan => orphan.id),
            ["FR-002", "FLOW-002", "ENT-002", "API-002", "UI-002", "EPIC-002", "TASK-002"]
        );
        assert.ok(result.errors.every(error => /\(.+:\d+\)$/.test(error)));
    }, { extraFiles: orphanHeadings });
});

test("does not count IDs mentioned in prose or code fences as matrix links", () => {
    const extraFiles = {
        "docs/01-prd/PRD.md": [
            DEFINITION_FILES["docs/01-prd/PRD.md"],
            "### FR-002",
            "The matrix mentions FR-002 outside its rows.",
            "```text",
            "| FR-002 | FLOW-001 | ENT-001 | API-001 | UI-001 | EPIC-001 | TASK-001 | |",
            "```"
        ].join("\n"),
        [MATRIX_PATH]: [
            "# Requirements Traceability Matrix",
            "",
            "FR-002 is discussed in this prose but not linked.",
            "",
            HEADER,
            SEPARATOR,
            MATRIX_ROW
        ].join("\n")
    };

    withRepository(root => {
        const result = validateOrphans(root);
        assert.deepEqual(
            result.orphanIds.map(orphan => orphan.id),
            ["FR-002"]
        );
    }, { extraFiles });
});

test("does not treat NFRs or ADRs as orphaned because they are not required matrix-chain IDs", () => {
    withRepository(root => {
        const result = validateOrphans(root);
        assert.deepEqual(result.errors, []);
    }, {
        extraFiles: {
            "docs/07-adr/ADR-001.md": [
                "# ADR-001",
                "## Informazioni Generali",
                "Stato: APPROVED",
                "## Contesto",
                "## Problema",
                "## Decisione",
                "## Motivazione"
            ].join("\n")
        }
    });
});

test("fails clearly and skips orphan checks when the matrix is malformed", () => {
    withRepository(root => {
        const matrixPath = path.join(root, MATRIX_PATH);
        fs.writeFileSync(
            matrixPath,
            ["# Matrix", "", "| FR | FLOW |", "| --- | --- |", "| FR-001 | FLOW-001 |"].join("\n")
        );

        const result = validateOrphans(root);
        assert.equal(
            result.errors[0],
            "Traceability Matrix non valida; controllo degli orfani non eseguito"
        );
        assert.deepEqual(result.orphanIds, []);
    });
});

test("fails when the matrix or a required owner document is missing", () => {
    withRepository(root => {
        fs.rmSync(path.join(root, MATRIX_PATH));
        assert.ok(validateOrphans(root).errors.some(error =>
            error.includes("Traceability Matrix mancante:")
        ));
    });

    withRepository(root => {
        fs.rmSync(path.join(root, "docs/04-design-system/DESIGN-SYSTEM.md"));
        assert.deepEqual(validateOrphans(root).errors, [
            "Documento proprietario degli ID UI mancante"
        ]);
    });
});

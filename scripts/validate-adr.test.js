const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateAdrDirectory
} = require("./validate-adr");

const VALID_ADR = `# ADR-001

## Informazioni Generali

Stato: APPROVED

## Contesto

Context.

## Problema

Problem.

## Decisione

Decision.

## Motivazione

Reason.
`;

function withAdrDirectory(run) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "adr-validator-"));

    try {
        run(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

test("accepts a template repository without real ADRs", () => {
    withAdrDirectory(directory => {
        fs.writeFileSync(path.join(directory, "ADR-TEMPLATE.md"), "# ADR-XXX\n");

        assert.deepEqual(validateAdrDirectory(directory), {
            errors: [],
            warnings: ["Nessuna ADR reale trovata"],
            realAdrCount: 0
        });
    });
});

test("accepts valid ADRs with numeric and descriptive filenames", () => {
    withAdrDirectory(directory => {
        fs.writeFileSync(path.join(directory, "ADR-TEMPLATE.md"), "# ADR-XXX\n");
        fs.writeFileSync(path.join(directory, "ADR-001.md"), VALID_ADR);
        fs.writeFileSync(path.join(directory, "ADR-002-JWT-AUTH.md"), VALID_ADR);

        const result = validateAdrDirectory(directory);

        assert.deepEqual(result.errors, []);
        assert.deepEqual(result.warnings, []);
        assert.equal(result.realAdrCount, 2);
    });
});

test("rejects missing ADR directory or template", () => {
    withAdrDirectory(directory => {
        const missingDirectory = validateAdrDirectory(
            path.join(directory, "missing")
        );
        assert.deepEqual(missingDirectory.errors, ["Cartella ADR assente"]);

        const missingTemplate = validateAdrDirectory(directory);
        assert.deepEqual(missingTemplate.errors, ["ADR-TEMPLATE assente"]);
    });
});

test("rejects ADRs with missing required sections or invalid status", () => {
    withAdrDirectory(directory => {
        fs.writeFileSync(path.join(directory, "ADR-TEMPLATE.md"), "# ADR-XXX\n");
        fs.writeFileSync(
            path.join(directory, "ADR-003.md"),
            "# ADR-003\n\n## Contesto\nNo status here.\n"
        );

        const result = validateAdrDirectory(directory);

        assert.deepEqual(result.errors, [
            "ADR-003.md sezione mancante: Informazioni Generali",
            "ADR-003.md sezione mancante: Problema",
            "ADR-003.md sezione mancante: Decisione",
            "ADR-003.md sezione mancante: Motivazione",
            "ADR-003.md stato ADR mancante o non valido"
        ]);
    });
});

test("rejects malformed ADR filenames", () => {
    withAdrDirectory(directory => {
        fs.writeFileSync(path.join(directory, "ADR-TEMPLATE.md"), "# ADR-XXX\n");

        for (const name of [
            "ADR001.md",
            "ADR01.md",
            "ADR_001.md",
            "adr-001.md",
            "ADR-01.md"
        ]) {
            fs.writeFileSync(path.join(directory, name), VALID_ADR);
        }

        const result = validateAdrDirectory(directory);

        assert.equal(result.errors.length, 5);
        assert.ok(result.errors.every(error => error.startsWith("Nome file ADR non valido:")));
        assert.equal(result.realAdrCount, 0);
    });
});

test("does not treat status words inside code examples as an ADR status", () => {
    withAdrDirectory(directory => {
        fs.writeFileSync(path.join(directory, "ADR-TEMPLATE.md"), "# ADR-XXX\n");
        fs.writeFileSync(
            path.join(directory, "ADR-004.md"),
            VALID_ADR.replace("Stato: APPROVED", "Stato: TBD") +
                "\n```text\nAPPROVED\n```\n"
        );

        const result = validateAdrDirectory(directory);

        assert.ok(result.errors.includes(
            "ADR-004.md stato ADR mancante o non valido"
        ));
    });
});

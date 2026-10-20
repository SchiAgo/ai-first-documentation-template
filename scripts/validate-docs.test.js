const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    findMissingDocuments
} = require("./validate-docs");

function withTemporaryDirectory(run) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "docs-validator-"));

    try {
        run(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

test("returns no missing documents when required paths exist", () => {
    withTemporaryDirectory(root => {
        const required = ["docs/PRD.md", "docs/TRD.md"];

        for (const file of required) {
            const fullPath = path.join(root, file);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, "");
        }

        assert.deepEqual(findMissingDocuments(root, required), []);
    });
});

test("reports each missing required document", () => {
    withTemporaryDirectory(root => {
        const required = [
            "docs/PRD.md",
            "docs/TRD.md",
            "docs/flows/FLOWS.md"
        ];
        const existing = path.join(root, "docs/PRD.md");
        fs.mkdirSync(path.dirname(existing), { recursive: true });
        fs.writeFileSync(existing, "# PRD\n");

        assert.deepEqual(
            findMissingDocuments(root, required),
            ["docs/TRD.md", "docs/flows/FLOWS.md"]
        );
    });
});

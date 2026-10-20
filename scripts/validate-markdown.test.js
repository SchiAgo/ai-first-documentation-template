const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    extractHeadings,
    validateMarkdown
} = require("./validate-markdown");

function withTemporaryDirectory(run) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "markdown-validator-"));

    try {
        run(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

function writeMarkdown(root, relativePath, content) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}

test("extracts headings outside fenced code blocks and preserves line numbers", () => {
    const headings = extractHeadings([
        "# Document",
        "```markdown",
        "### Example heading",
        "```",
        "## Real section"
    ].join("\n"));

    assert.deepEqual(headings, [
        { level: 1, title: "Document", line: 1 },
        { level: 2, title: "Real section", line: 5 }
    ]);
});

test("passes when all required sections and heading hierarchy are valid", () => {
    withTemporaryDirectory(root => {
        writeMarkdown(root, "docs/PRD.md", [
            "# PRD",
            "## Vision",
            "### Requirements"
        ].join("\n"));

        assert.deepEqual(
            validateMarkdown(root, { "docs/PRD.md": ["Vision", "Requirements"] }),
            { errors: [], validatedFiles: 1 }
        );
    });
});

test("reports missing, empty, and heading-free documents", () => {
    withTemporaryDirectory(root => {
        writeMarkdown(root, "docs/empty.md", " \n");
        writeMarkdown(root, "docs/plain.md", "Text without headings.");

        const result = validateMarkdown(root, {
            "docs/missing.md": [],
            "docs/empty.md": [],
            "docs/plain.md": []
        });

        assert.deepEqual(result.errors, [
            "❌ File mancante: docs/missing.md",
            "❌ File vuoto: docs/empty.md",
            "❌ docs/plain.md -> nessun heading markdown trovato"
        ]);
    });
});

test("reports missing required sections, empty headings, and hierarchy jumps", () => {
    withTemporaryDirectory(root => {
        writeMarkdown(root, "docs/PRD.md", [
            "# PRD",
            "### Deep section",
            "##",
            "## Present"
        ].join("\n"));

        const result = validateMarkdown(root, {
            "docs/PRD.md": ["Required", "Present"]
        });

        assert.deepEqual(result.errors, [
            '❌ docs/PRD.md -> sezione obbligatoria mancante: "Required"',
            "❌ docs/PRD.md -> heading vuoto alla linea 3",
            "❌ docs/PRD.md -> salto gerarchico alla linea 2 (1 -> 3)"
        ]);
    });
});

test("does not accept required section text that is not a heading", () => {
    withTemporaryDirectory(root => {
        writeMarkdown(root, "docs/PRD.md", [
            "# PRD",
            "The document mentions Vision but has no matching section."
        ].join("\n"));

        const result = validateMarkdown(root, {
            "docs/PRD.md": ["Vision"]
        });

        assert.deepEqual(result.errors, [
            '❌ docs/PRD.md -> sezione obbligatoria mancante: "Vision"'
        ]);
    });
});

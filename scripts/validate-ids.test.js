const test = require("node:test");
const assert = require("node:assert/strict");

const {
    extractDefinitions,
    findDuplicateDefinitions,
    findInvalidIds
} = require("./validate-ids");

test("accepts formatted IDs and documented placeholders", () => {
    const content = [
        "### FR-001",
        "Related to FLOW-002 and ADR-XXX.",
        "Prompt placeholder: [API-ID]."
    ].join("\n");

    assert.deepEqual(findInvalidIds(content, "fixture.md"), []);
});

test("rejects malformed IDs including lowercase prefixes and separators", () => {
    const content = [
        "FR-1",
        "FLOW_001",
        "api-001",
        "TASK-0001",
        "FR-000",
        "ADR-"
    ].join("\n");

    assert.deepEqual(
        findInvalidIds(content, "fixture.md").map(issue => issue.id),
        ["FR-1", "FLOW_001", "api-001", "TASK-0001", "FR-000", "ADR-"]
    );
});

test("does not validate identifiers inside fenced code examples", () => {
    const content = [
        "Valid ID: FR-001",
        "```text",
        "Invalid example: FR-1",
        "```"
    ].join("\n");

    assert.deepEqual(findInvalidIds(content, "fixture.md"), []);
});

test("collects definitions from headings but ignores ordinary references", () => {
    const content = [
        "### FR-001",
        "Related: FR-001",
        "```markdown",
        "### FR-002",
        "```"
    ].join("\n");

    assert.deepEqual(
        extractDefinitions(content, "PRD.md"),
        [{ id: "FR-001", file: "PRD.md", lineNumber: 1 }]
    );
});

test("reports repeated definitions with source locations", () => {
    const definitions = [
        { id: "FR-001", file: "PRD.md", lineNumber: 10 },
        { id: "FR-001", file: "PRD.md", lineNumber: 30 },
        { id: "FLOW-001", file: "FLOWS.md", lineNumber: 5 }
    ];

    assert.deepEqual(
        findDuplicateDefinitions(definitions),
        [{
            id: "FR-001",
            first: definitions[0],
            duplicate: definitions[1]
        }]
    );
});

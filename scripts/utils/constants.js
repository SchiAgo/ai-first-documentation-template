module.exports = {
    REQUIRED_DOCUMENTS: [
        "docs/01-prd/PRD.md",
        "docs/02-trd/TRD.md",
        "docs/03-application-flows/APPLICATION-FLOWS.md",
        "docs/04-design-system/DESIGN-SYSTEM.md",
        "docs/05-data-architecture/DATA-ARCHITECTURE.md",
        "docs/06-implementation-plan/IMPLEMENTATION-PLAN.md"
    ],

    ID_PATTERNS: {
        FR: /FR-\\d{3}/g,
        FLOW: /FLOW-\\d{3}/g,
        ENT: /ENT-\\d{3}/g,
        API: /API-\\d{3}/g,
        UI: /UI-\\d{3}/g,
        EPIC: /EPIC-\\d{3}/g,
        TASK: /TASK-\\d{3}/g,
        ADR: /ADR-\\d{3}/g
    }
};
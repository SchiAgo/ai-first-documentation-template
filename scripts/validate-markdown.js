const fs = require("fs");

/**
 * Documenti obbligatori e sezioni minime richieste.
 */
const requiredSections = {
    "docs/01-prd/PRD.md": [
        "Informazioni Documento",
        "Visione del Prodotto",
        "Requisiti Funzionali",
        "Requisiti Non Funzionali"
    ],

    "docs/02-trd/TRD.md": [
        "Architettura Generale",
        "Stack Tecnologico",
        "Architettura Backend",
        "Architettura Frontend"
    ],

    "docs/03-application-flows/APPLICATION-FLOWS.md": [
        "Informazioni Documento",
        "FLOW-001",
        "Navigation Flow",
        "User Flow"
    ],

    "docs/05-data-architecture/DATA-ARCHITECTURE.md": [
        "Informazioni Documento",
        "Storage Architecture",
        "Data Domains",
        "Data Lifecycle"
    ],

    "docs/06-implementation-plan/IMPLEMENTATION-PLAN.md": [
        "Informazioni Documento",
        "Strategia Implementativa",
        "Roadmap",
        "Milestone"
    ]
};

/**
 * Estrae tutti gli heading markdown.
 */
function extractHeadings(content) {
    const headings = [];

    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
        const match = line.match(/^(#{1,6})\s+(.*)$/);

        if (match) {
            headings.push({
                level: match[1].length,
                title: match[2].trim(),
                line: index + 1
            });
        }
    });

    return headings;
}

/**
 * Verifica che le sezioni obbligatorie siano presenti.
 */
function validateRequiredSections(content, file, sections) {
    let hasErrors = false;

    for (const section of sections) {
        if (!content.includes(section)) {
            console.error(
                `❌ ${file} -> sezione obbligatoria mancante: "${section}"`
            );

            hasErrors = true;
        }
    }

    return hasErrors;
}

/**
 * Verifica heading vuoti.
 */
function validateEmptyHeadings(headings, file) {
    let hasErrors = false;

    for (const heading of headings) {
        if (heading.title.length === 0) {
            console.error(
                `❌ ${file} -> heading vuoto alla linea ${heading.line}`
            );

            hasErrors = true;
        }
    }

    return hasErrors;
}

/**
 * Verifica salti gerarchici.
 *
 * Valido:
 * # -> ##
 * ## -> ###
 *
 * Non valido:
 * # -> ###
 * ## -> ####
 */
function validateHeadingHierarchy(headings, file) {
    let hasErrors = false;

    let previousLevel = 0;

    for (const heading of headings) {
        if (
            previousLevel > 0 &&
            heading.level > previousLevel + 1
        ) {
            console.error(
                `❌ ${file} -> salto gerarchico alla linea ${heading.line} (${previousLevel} -> ${heading.level})`
            );

            hasErrors = true;
        }

        previousLevel = heading.level;
    }

    return hasErrors;
}

/**
 * Verifica duplicati sullo stesso livello.
 */
function validateDuplicateHeadings(headings, file) {
    let hasErrors = false;

    const seen = new Set();

    for (const heading of headings) {
        const key = `${heading.level}|${heading.title}`;

        if (seen.has(key)) {
            console.error(
                `❌ ${file} -> heading duplicato "${heading.title}"`
            );

            hasErrors = true;
        } else {
            seen.add(key);
        }
    }

    return hasErrors;
}

/**
 * Validazione principale.
 */
function runValidation() {
    let globalErrors = false;

    for (const [file, sections] of Object.entries(requiredSections)) {
        let fileHasErrors = false;

        if (!fs.existsSync(file)) {
            console.error(
                `❌ File mancante: ${file}`
            );

            globalErrors = true;
            continue;
        }

        const content = fs.readFileSync(
            file,
            "utf8"
        );

        if (!content.trim()) {
            console.error(
                `❌ File vuoto: ${file}`
            );

            globalErrors = true;
            continue;
        }

        const headings = extractHeadings(content);

        if (headings.length === 0) {
            console.error(
                `❌ ${file} -> nessun heading markdown trovato`
            );

            fileHasErrors = true;
        }

        fileHasErrors =
            validateRequiredSections(
                content,
                file,
                sections
            ) || fileHasErrors;

        fileHasErrors =
            validateEmptyHeadings(
                headings,
                file
            ) || fileHasErrors;

        fileHasErrors =
            validateHeadingHierarchy(
                headings,
                file
            ) || fileHasErrors;

        if (fileHasErrors) {
            globalErrors = true;
        } else {
            console.log(
                `✅ ${file}`
            );
        }
    }

    if (globalErrors) {
        console.error(
            "\n❌ Markdown validation FAILED"
        );

        process.exit(1);
    }

    console.log(
        "\n✅ Markdown validation PASSED"
    );
}

/**
 * Entry point
 */
runValidation();
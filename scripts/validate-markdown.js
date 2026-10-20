const fs = require("fs");
const path = require("path");

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

function extractHeadings(content) {
    const headings = [];
    let fenceCharacter = null;
    let fenceLength = 0;

    for (const [index, line] of content.split(/\r?\n/).entries()) {
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

            continue;
        }

        if (fenceCharacter !== null) {
            continue;
        }

        const match = line.match(/^\s{0,3}(#{1,6})(?:\s+(.*)|\s*)$/);

        if (match) {
            headings.push({
                level: match[1].length,
                title: (match[2] || "").replace(/\s+#+\s*$/, "").trim(),
                line: index + 1
            });
        }
    }

    return headings;
}

function validateMarkdownFile(filePath, relativePath, required = []) {
    const errors = [];

    if (!fs.existsSync(filePath)) {
        return [`❌ File mancante: ${relativePath}`];
    }

    const content = fs.readFileSync(filePath, "utf8");

    if (!content.trim()) {
        return [`❌ File vuoto: ${relativePath}`];
    }

    const headings = extractHeadings(content);

    if (headings.length === 0) {
        errors.push(`❌ ${relativePath} -> nessun heading markdown trovato`);
    }

    for (const section of required) {
        const hasSection = headings.some(heading =>
            heading.title === section ||
            heading.title.startsWith(`${section} `)
        );

        if (!hasSection) {
            errors.push(
                `❌ ${relativePath} -> sezione obbligatoria mancante: "${section}"`
            );
        }
    }

    for (const heading of headings) {
        if (!heading.title) {
            errors.push(
                `❌ ${relativePath} -> heading vuoto alla linea ${heading.line}`
            );
        }
    }

    for (let index = 1; index < headings.length; index += 1) {
        const previous = headings[index - 1];
        const current = headings[index];

        if (current.level > previous.level + 1) {
            errors.push(
                `❌ ${relativePath} -> salto gerarchico alla linea ${current.line} (${previous.level} -> ${current.level})`
            );
        }
    }

    return errors;
}

function validateMarkdown(rootDirectory, sectionsByFile = requiredSections) {
    const errors = [];
    const files = Object.entries(sectionsByFile);

    for (const [relativePath, required] of files) {
        errors.push(...validateMarkdownFile(
            path.join(rootDirectory, relativePath),
            relativePath,
            required
        ));
    }

    return {
        errors,
        validatedFiles: files.length
    };
}

function runValidation() {
    const rootDirectory = path.resolve(__dirname, "..");
    const result = validateMarkdown(rootDirectory);

    if (result.errors.length > 0) {
        result.errors.forEach(error => console.error(error));
        console.error("\n❌ Markdown validation FAILED");
        process.exitCode = 1;
        return;
    }

    for (const file of Object.keys(requiredSections)) {
        console.log(`✅ ${file}`);
    }

    console.log("\n✅ Markdown validation PASSED");
}

if (require.main === module) {
    runValidation();
}

module.exports = {
    extractHeadings,
    validateMarkdown,
    validateMarkdownFile
};

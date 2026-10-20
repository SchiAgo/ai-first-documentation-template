const fs = require("fs");
const path = require("path");

const TEMPLATE_FILE = "ADR-TEMPLATE.md";
const ADR_FILE_PATTERN = /^ADR-\d{3}.*\.md$/;
const ADR_CANDIDATE_PATTERN = /^adr(?:[-_]?\d)/i;
const REQUIRED_SECTIONS = [
    "Informazioni Generali",
    "Contesto",
    "Problema",
    "Decisione",
    "Motivazione"
];
const VALID_STATUSES = [
    "PROPOSED",
    "APPROVED",
    "REJECTED",
    "DEPRECATED"
];

function getLinesOutsideFences(content) {
    const result = [];
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

        result.push({
            line,
            lineNumber: index + 1
        });
    }

    return result;
}

function getMarkdownHeadings(content) {
    const headings = [];

    for (const { line, lineNumber } of getLinesOutsideFences(content)) {
        const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);

        if (heading) {
            headings.push({
                title: heading[2].trim(),
                lineNumber
            });
        }
    }

    return headings;
}

function validateAdrFile(filePath, fileName) {
    const content = fs.readFileSync(filePath, "utf8");
    const headings = getMarkdownHeadings(content);
    const errors = [];
    const headingTitles = new Set(
        headings.map(heading => heading.title.toLowerCase())
    );

    for (const section of REQUIRED_SECTIONS) {
        if (!headingTitles.has(section.toLowerCase())) {
            errors.push(
                `${fileName} sezione mancante: ${section}`
            );
        }
    }

    const statusPattern = new RegExp(
        `\\b(?:${VALID_STATUSES.join("|")})\\b`
    );

    const contentOutsideFences = getLinesOutsideFences(content)
        .map(({ line }) => line)
        .join("\n");

    if (!statusPattern.test(contentOutsideFences)) {
        errors.push(`${fileName} stato ADR mancante o non valido`);
    }

    return errors;
}

function validateAdrDirectory(adrDirectory) {
    const errors = [];
    const warnings = [];

    if (!fs.existsSync(adrDirectory) || !fs.statSync(adrDirectory).isDirectory()) {
        return {
            errors: ["Cartella ADR assente"],
            warnings,
            realAdrCount: 0
        };
    }

    const entries = fs.readdirSync(adrDirectory, { withFileTypes: true });
    const templateExists = entries.some(entry =>
        entry.isFile() && entry.name === TEMPLATE_FILE
    );

    if (!templateExists) {
        errors.push("ADR-TEMPLATE assente");
    }

    const files = entries
        .filter(entry => entry.isFile())
        .map(entry => entry.name);
    const invalidAdrNames = files.filter(file =>
        ADR_CANDIDATE_PATTERN.test(file) &&
        !ADR_FILE_PATTERN.test(file)
    );

    for (const file of invalidAdrNames) {
        errors.push(
            `Nome file ADR non valido: ${file} (formato atteso ADR-NNN[-TITOLO].md)`
        );
    }

    const realAdrFiles = files.filter(file => ADR_FILE_PATTERN.test(file));

    for (const file of realAdrFiles) {
        errors.push(
            ...validateAdrFile(path.join(adrDirectory, file), file)
        );
    }

    if (realAdrFiles.length === 0) {
        warnings.push("Nessuna ADR reale trovata");
    }

    return {
        errors,
        warnings,
        realAdrCount: realAdrFiles.length
    };
}

function runValidation() {
    const adrDirectory = path.resolve(__dirname, "..", "docs", "07-adr");
    const result = validateAdrDirectory(adrDirectory);

    for (const error of result.errors) {
        console.error(`❌ ${error}`);
    }

    if (result.errors.length > 0) {
        console.error("\n❌ ADR validation FAILED");
        process.exitCode = 1;
        return;
    }

    console.log("✅ Cartella ADR presente");
    console.log("✅ ADR-TEMPLATE presente");

    if (result.realAdrCount > 0) {
        console.log(`✅ ADR reali trovate: ${result.realAdrCount}`);
    }

    for (const warning of result.warnings) {
        console.warn(`⚠️ ${warning}`);
    }

    if (result.realAdrCount === 0) {
        console.warn("⚠️ Repository in modalità template");
    }

    console.log("\n✅ ADR validation PASSED");
}

if (require.main === module) {
    runValidation();
}

module.exports = {
    validateAdrDirectory
};

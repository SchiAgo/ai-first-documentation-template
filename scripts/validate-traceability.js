const fs = require("fs");

const matrixPath =
    "docs/09-traceability/REQUIREMENTS-TRACEABILITY-MATRIX.md";

if (!fs.existsSync(matrixPath)) {
    console.error(
        "❌ Traceability Matrix mancante"
    );

    process.exit(1);
}

const content =
    fs.readFileSync(
        matrixPath,
        "utf8"
    );

if (!content.includes("| FR |")) {
    console.error(
        "❌ Traceability Matrix non valida"
    );

    process.exit(1);
}

console.log(
    "✅ Traceability Matrix valida"
);
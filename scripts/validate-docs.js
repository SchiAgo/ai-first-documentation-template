const fs = require("fs");

const {
    REQUIRED_DOCUMENTS
} = require("./utils/constants");

const missing = [];

for (const file of REQUIRED_DOCUMENTS) {
    if (!fs.existsSync(file)) {
        missing.push(file);
    }
}

if (missing.length > 0) {
    console.error(
        "Documenti mancanti:"
    );

    missing.forEach(file =>
        console.error(`- ${file}`)
    );

    process.exit(1);
}

console.log(
    "✅ Struttura documentale valida"
);
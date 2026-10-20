const fs = require("fs");
const path = require("path");

const {
    REQUIRED_DOCUMENTS
} = require("./utils/constants");

function findMissingDocuments(rootDirectory, requiredDocuments = REQUIRED_DOCUMENTS) {
    return requiredDocuments.filter(relativePath =>
        !fs.existsSync(path.join(rootDirectory, relativePath))
    );
}

function runValidation() {
    const rootDirectory = path.resolve(__dirname, "..");
    const missing = findMissingDocuments(rootDirectory);

    if (missing.length > 0) {
        console.error("Documenti mancanti:");
        missing.forEach(file => console.error(`- ${file}`));
        process.exitCode = 1;
        return;
    }

    console.log("✅ Struttura documentale valida");
}

if (require.main === module) {
    runValidation();
}

module.exports = {
    findMissingDocuments
};

const fs = require("fs");

const {
    getMarkdownFiles
} = require("./utils/file-utils");

const {
    ID_PATTERNS
} = require("./utils/constants");

const ids = [];

for (const file of getMarkdownFiles("docs")) {
    const content =
        fs.readFileSync(file, "utf8");

    Object.values(ID_PATTERNS)
        .forEach(pattern => {
            const matches =
                content.match(pattern) || [];

            ids.push(...matches);
        });
}

const duplicates =
    ids.filter(
        (item, index) =>
            ids.indexOf(item) !== index
    );

if (duplicates.length > 0) {
    console.error(
        "❌ ID duplicati:"
    );

    console.error(
        [...new Set(duplicates)]
    );

    process.exit(1);
}

console.log(
    "✅ Nessun ID duplicato"
);
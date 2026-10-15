const fs = require("fs");
const path = require("path");

const adrFolder =
    "docs/07-adr";

const files =
    fs.readdirSync(adrFolder);

const realAdr = files.filter(file =>
    /^ADR-\\d{3}\\.md$/.test(file)
);

if (realAdr.length === 0) {
    console.error(
        "❌ Nessun ADR reale trovato"
    );

    process.exit(1);
}

console.log(
    `✅ ADR trovate: ${realAdr.length}`
);
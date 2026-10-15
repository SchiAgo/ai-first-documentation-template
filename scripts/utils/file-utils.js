const fs = require("fs");
const path = require("path");

function getMarkdownFiles(dir) {
    let results = [];

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(
                getMarkdownFiles(fullPath)
            );
        } else if (fullPath.endsWith(".md")) {
            results.push(fullPath);
        }
    }

    return results;
}

module.exports = {
    getMarkdownFiles
};
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT_DIR = path.join(__dirname, '../out');
const ASSET_DIR_NAME = 'next-assets'; // Rename _next to this

function main() {
    if (!fs.existsSync(OUT_DIR)) {
        console.error('out directory not found. Run next build first.');
        process.exit(1);
    }

    console.log('Cleaning up Chrome Extension build...');

    // 1. Remove files starting with "_" or "__" or "." in the root of out
    const files = fs.readdirSync(OUT_DIR);
    files.forEach(file => {
        // Skip _next directory for a moment, we will rename it
        if (file === '_next') return;

        // Remove files starting with "_" or "__" or "." (like .DS_Store)
        if (file.startsWith('_') || file.startsWith('.') || file === '404.html') {
            // 404.html is sometimes problematic or not needed if _not-found is present, but let's strictly stick to the user error.
            // The user error specifically mentioned __next.._tree.txt.
            const filePath = path.join(OUT_DIR, file);
            console.log(`Removing build artifact: ${file}`);
            try {
                fs.rmSync(filePath, { recursive: true, force: true });
            } catch (e) {
                console.error(`Failed to remove ${file}:`, e);
            }
        }
    });

    // 2. Rename _next to next-assets
    const oldPath = path.join(OUT_DIR, '_next');
    const newPath = path.join(OUT_DIR, ASSET_DIR_NAME);

    if (fs.existsSync(oldPath)) {
        console.log(`Renaming _next to ${ASSET_DIR_NAME}...`);
        fs.renameSync(oldPath, newPath);
    }

    // 3. Replace references in HTML and JS files
    // We need to replace "/_next/" with "/next-assets/"
    // And also "_next/" with "next-assets/" just in case (e.g. relative paths)

    console.log('Updating file references...');
    replaceInDir(OUT_DIR);

    console.log('Extensions cannot have inline scripts. Extracting them...');
    extractInlineScripts(OUT_DIR);

    console.log('Extension build preparation complete!');
}

function extractInlineScripts(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            extractInlineScripts(itemPath);
        } else if (item.endsWith('.html')) {
            let content = fs.readFileSync(itemPath, 'utf8');
            let hasChanges = false;

            // Regex to find inline scripts: <script ...>content</script>
            // We look for scripts that do NOT have a src attribute
            const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gmi;

            let match;
            let newHtml = content;
            let scriptIndex = 0;

            // We need to loop carefully or replace carefully. 
            // Using replace with callback is easier.
            newHtml = content.replace(scriptRegex, (fullMatch, attributes, scriptContent) => {
                // Check for src attribute (robustly)
                if (/src\s*=/i.test(attributes)) {
                    return fullMatch; // Skip scripts with src
                }

                // Check for non-executable types (JSON data)
                if (/type\s*=\s*['"]application\/(ld\+)?json['"]/i.test(attributes)) {
                    return fullMatch; // Skip data blocks
                }

                if (!scriptContent.trim()) {
                    return fullMatch; // Skip empty scripts
                }

                // Create a new file for this script
                const filename = path.basename(itemPath, '.html');
                const scriptFilename = `${filename}-inline-${scriptIndex++}.js`;
                const scriptPath = path.join(path.dirname(itemPath), scriptFilename);

                fs.writeFileSync(scriptPath, scriptContent);
                console.log(`Extracted inline script to ${scriptFilename}`);

                return `<script src="${scriptFilename}" ${attributes}></script>`;
            });

            if (newHtml !== content) {
                fs.writeFileSync(itemPath, newHtml);
            }
        }
    });
}

function replaceInDir(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            replaceInDir(itemPath);
        } else if (item.endsWith('.html') || item.endsWith('.js') || item.endsWith('.css') || item.endsWith('.json')) {
            // Read file
            let content = fs.readFileSync(itemPath, 'utf8');

            // Perform replacement
            // Regex to capture /_next/ and just _next/ where appropriate
            // We'll simplisticly replace /_next/ with /next-assets/
            // and also the string "_next/static" which appears in JS bundles

            const originalContent = content;

            // Global replace for /_next/ -> /next-assets/
            content = content.replace(/\/_next\//g, `/${ASSET_DIR_NAME}/`);

            // Handle relative paths (e.g., ./_next/ or just _next/)
            content = content.replace(/\.\/_next\//g, `./${ASSET_DIR_NAME}/`);

            // Handle HTML attributes with explicit quotes (both single and double)
            content = content.replace(/=\"_next\//g, `="${ASSET_DIR_NAME}/`);
            content = content.replace(/='_next\//g, `='${ASSET_DIR_NAME}/`);

            // Also handle cases where it might be "_next/" (without leading slash, e.g. in some JS strings or encoded)
            // But be careful not to break other things. Usually next.js webpack chunks strictly use paths.
            // A safer bet for JS bundles is replacing key strings.

            content = content.replace(/\"_next\//g, `"${ASSET_DIR_NAME}/`);
            content = content.replace(/'_next\//g, `'${ASSET_DIR_NAME}/`);

            // Handle CSS url() paths if any
            content = content.replace(/url\(\/_next\//g, `url(/${ASSET_DIR_NAME}/`);

            // Fix for Next.js 14+ specific static paths in JS
            content = content.replace(/"static\/chunks\/pages\/"/g, `"static/chunks/pages/"`); // Just to be safe

            if (content !== originalContent) {
                fs.writeFileSync(itemPath, content);
            }
        }
    });
}

main();

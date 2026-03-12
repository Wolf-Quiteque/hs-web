/**
 * inject-editor.js
 * Run once from the hs-web directory: node inject-editor.js
 *
 * Adds editor.css <link> and editor.js <script> to every HTML page
 * (excluding admin.html and *.bak* files).
 *
 * Detects depth by the main.js path prefix:
 *   "js/main.js"     → root level  (css/editor.css, js/editor.js)
 *   "../js/main.js"  → 1 level deep (../css/editor.css, ../js/editor.js)
 *   "../../js/main.js" → 2 levels deep (../../css/editor.css, ../../js/editor.js)
 */

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname; // should be the hs-web directory

function getAllHtmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip hidden dirs, node_modules, css, js, fonts, images, vid
      const skip = ['node_modules', '.git', 'css', 'js', 'fonts', 'images', 'vid'];
      if (!skip.includes(entry.name)) {
        getAllHtmlFiles(fullPath, files);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      // Skip admin.html and any .bak files
      if (entry.name === 'admin.html') continue;
      if (entry.name.includes('.bak')) continue;
      files.push(fullPath);
    }
  }
  return files;
}

function injectIntoFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const rel   = path.relative(ROOT, filePath).replace(/\\/g, '/');

  // Determine depth prefix from how main.js is referenced
  let prefix = '';
  if (content.includes('"../../js/main.js"') || content.includes("'../../js/main.js'")) {
    prefix = '../../';
  } else if (content.includes('"../js/main.js"') || content.includes("'../js/main.js'")) {
    prefix = '../';
  } else {
    prefix = '';
  }

  const cssLink   = `  <link rel="stylesheet" href="${prefix}css/editor.css">`;
  const jsScript  = `  <script src="${prefix}js/editor.js" defer></script>`;
  // Match both attribute orderings and defer formats
  const mainJsPatterns = [
    `<script src="${prefix}js/main.js" defer></script>`,
    `<script src="${prefix}js/main.js"></script>`,
    `<script defer="" src="${prefix}js/main.js"></script>`,
    `<script defer src="${prefix}js/main.js"></script>`,
  ];
  const mainCssTag = `href="${prefix}css/main.css"`;

  // ── 1. Inject editor.css after main.css link (if not already present) ──
  if (content.includes(`href="${prefix}css/editor.css"`)) {
    console.log(`  [SKIP CSS] ${rel} — already has editor.css`);
  } else if (content.includes(mainCssTag)) {
    // Find the full <link ...main.css...> line and insert after
    content = content.replace(
      new RegExp(`(<link[^>]*${prefix.replace(/\./g,'\\.')}css/main\\.css[^>]*>)`),
      `$1\n${cssLink}`
    );
    console.log(`  [CSS+]  ${rel}`);
  } else {
    console.warn(`  [WARN] ${rel} — could not find main.css link`);
  }

  // ── 2. Inject editor.js BEFORE main.js script (if not already present) ──
  if (content.includes(`src="${prefix}js/editor.js"`)) {
    console.log(`  [SKIP JS] ${rel} — already has editor.js`);
  } else {
    let matched = false;
    for (const mainJsTag of mainJsPatterns) {
      if (content.includes(mainJsTag)) {
        content = content.replace(mainJsTag, `${jsScript}\n  ${mainJsTag}`);
        console.log(`  [JS+]   ${rel}`);
        matched = true;
        break;
      }
    }
    if (!matched) {
      console.warn(`  [WARN] ${rel} — could not find main.js script tag`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

// ── Main ────────────────────────────────────────────────────
const files = getAllHtmlFiles(ROOT);
console.log(`Found ${files.length} HTML files to process.\n`);
let patched = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  injectIntoFile(f);
  const after = fs.readFileSync(f, 'utf8');
  if (before !== after) patched++;
}
console.log(`\nDone. ${patched}/${files.length} files patched.`);

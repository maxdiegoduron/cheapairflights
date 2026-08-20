/**
 * Injects PWA / iOS home-screen meta tags into the exported index.html.
 *
 * Expo Router's `+html.tsx` hook only applies to static rendering. This app
 * exports as a single-page app (app.json -> web.output: "single") to avoid
 * prerendering browser-only code in Node, so the tags are added here instead.
 */
const fs = require("fs");
const path = require("path");

const INDEX = path.join(__dirname, "..", "dist", "index.html");

const TAGS = `
    <meta name="description" content="Find the cheapest day to fly a route." />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Flights" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#F2F2F7" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
`;

if (!fs.existsSync(INDEX)) {
  console.error(`postbuild-web: ${INDEX} not found — did the export run?`);
  process.exit(1);
}

let html = fs.readFileSync(INDEX, "utf8");

if (html.includes("apple-mobile-web-app-capable")) {
  console.log("postbuild-web: PWA tags already present, skipping.");
  process.exit(0);
}

// Extend the viewport to cover the iPhone's safe areas when launched
// fullscreen from the home screen.
html = html.replace(
  'content="width=device-width, initial-scale=1, shrink-to-fit=no"',
  'content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"'
);

html = html.replace("</head>", `${TAGS}  </head>`);

fs.writeFileSync(INDEX, html, "utf8");
console.log("postbuild-web: injected PWA meta tags into dist/index.html");

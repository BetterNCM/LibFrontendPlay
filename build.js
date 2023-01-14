const fs = require("fs");
const { build } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const path = require("path");
const manifest = require("./manifest.json");
const entryPoints = [];
const checkEntry = (path) => {
    if (fs.existsSync(path)) entryPoints.push(path);
};

checkEntry("src/index.tsx");
checkEntry("src/startup_script.ts");

const betterncmUserPath = process.env["BETTERNCM_PROFILE"] || "C:/betterncm";
const devPath = path.resolve(betterncmUserPath, "plugins_dev", manifest.name);

if (!process.argv.includes("--dist")) {
    if (!fs.existsSync(devPath)) {
        fs.mkdirSync(devPath, { recursive: true });
    }
    fs.copyFileSync("manifest.json", path.resolve(devPath, "manifest.json"));
}

build({
    entryPoints,
    bundle: true,
    sourcemap: process.argv.includes("--dev") ? "inline" : false,
    minify: !process.argv.includes("--dev"),
    outdir: process.argv.includes("--dist") ? "dist" : devPath,
    define: {
        DEBUG: process.argv.includes("--dev").toString(),
    },
    watch: process.argv.includes("--watch")
        ? {
              onRebuild(err, result) {
                  console.log("Rebuilding");
                  if (err) {
                      console.warn(err.message);
                  } else if (result) {
                      console.log("Build success");
                  }
              },
          }
        : undefined,
    plugins: [sassPlugin()],
}).then((result) => {
    console.log("Build success");
    if (process.argv.includes("--dist")) {
        const plugin = new JSZip();
        function addIfExist(filename, name = filename) {
            if (fs.existsSync(filename))
                plugin.file(name, fs.readFileSync(filename));
        }
        if (process.argv.includes("--dist")) {
            addIfExist("dist/manifest.json", "manifest.json");
            addIfExist("dist/index.js", "index.js");
            addIfExist("dist/index.css", "index.css");
            addIfExist("dist/startup_script.js", "startup_script.js");
        } else {
            addIfExist("manifest.json");
            addIfExist("index.js");
            addIfExist("index.css");
            addIfExist("startup_script.js");
        }
        const output = plugin.generateNodeStream({
            compression: "DEFLATE",
            compressionOptions: {
                level: 9,
            },
        });
        output.pipe(fs.createWriteStream("Apple Music-like lyrics.plugin"));
        fs.copyFileSync("manifest.json", "dist/manifest.json");
        fs.copyFileSync("assets/thumbnail.svg", "dist/thumbnail.svg");
    }
});

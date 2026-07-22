const { existsSync, readFileSync } = require("fs");
const { execSync } = require("child_process");

const envFile = ".vercel/.env.production.local";

if (existsSync(envFile)) {
  const lines = readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx > 0) {
      let key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const cmd = process.argv.slice(2).join(" ");
if (cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

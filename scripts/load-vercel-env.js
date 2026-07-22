const { existsSync } = require("fs");
const { execSync } = require("child_process");

const envFile = ".vercel/.env.production.local";

if (existsSync(envFile)) {
  require("dotenv").config({ path: envFile, override: true });
}

const cmd = process.argv.slice(2).join(" ");
if (cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

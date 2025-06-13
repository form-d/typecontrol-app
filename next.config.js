const childProcess = require("child_process");
const { version } = require("./package.json");

function getGitCommitHash() {
  try {
    return childProcess
      .execSync("git rev-parse --short HEAD")
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_GIT_COMMIT: getGitCommitHash(),
  },
};

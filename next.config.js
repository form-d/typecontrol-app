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

const commitMessage = childProcess
  .execSync("git log -1 --pretty=%B")
  .toString()
  .trim();
const commitAuthor = childProcess
  .execSync("git log -1 --pretty=%an")
  .toString()
  .trim();
const commitDate = childProcess
  .execSync("git log -1 --pretty=%ad")
  .toString()
  .trim();

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_GIT_COMMIT: getGitCommitHash(),
    NEXT_PUBLIC_COMMIT_MESSAGE: commitMessage,
    NEXT_PUBLIC_COMMIT_AUTHOR: commitAuthor,
    NEXT_PUBLIC_COMMIT_DATE: commitDate,
  },
};

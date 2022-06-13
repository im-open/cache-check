const core = require('@actions/core');
const cache = require('@martijnhols/actions-cache');

// When used, this requiredArgOptions will cause the action to error if a value has not been provided.
const requiredArgOptions = {
  required: true,
  trimWhitespace: true
};
const cacheKey = core.getInput('key', requiredArgOptions);
const cachePaths = core.getInput('paths', requiredArgOptions);

//const token = core.getInput('github-token', requiredArgOptions);
//const octokit = github.getOctokit(token);

async function run() {
  try {
    core.setOutput('key', cacheKey);

    // getCacheEntry isn't imported directly but it is included in the @actions/exec package.
    const cacheEntry = await cache.getCacheEntry(cachePaths, cacheKey);
    if (cacheEntry !== null) {
      core.info(`Cache AVAILABLE for input key: ${cacheKey}`);
      core.setOutput('cache-hit', true);
    } else {
      core.info(`Cache MISSING for input key: ${cacheKey}`);
      core.setOutput('cache-hit', false);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

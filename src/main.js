import * as core from '@actions/core';
import * as cache from '@martijnhols/actions-cache';

// When used, this requiredArgOptions will cause the action to error if a value has not been provided.
const requiredArgOptions = {
  required: true,
  trimWhitespace: true
};
const primaryKey = core.getInput('key', requiredArgOptions);
const cachePathsRaw = core.getInput('path', requiredArgOptions);
const cachePaths = cachePathsRaw
  .split('\n')
  .map(s => s.trim())
  .filter(x => x !== '');

async function run() {
  try {
    core.setOutput('primary-key', primaryKey);

    const cacheEntry = await cache.getCacheEntry(cachePaths, primaryKey);
    if (cacheEntry !== null) {
      core.info(`✅ Cache AVAILABLE for input key: ${primaryKey}`);
      core.setOutput('cache-hit', true);
    } else {
      core.info(`❌ Cache MISSING for input key: ${primaryKey}`);
      core.setOutput('cache-hit', true);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
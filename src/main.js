const core = require('@actions/core')
const {
  groupCommits,
  generateChangelogString,
  determineHowToVersion
} = require('./generator')
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const commits = JSON.parse(core.getInput('semantic_commits'))
    const mappings = await groupCommits(commits)
    const type = await determineHowToVersion(commits)
    const changelog = await generateChangelogString(mappings)
    core.setOutput('changelog', changelog)
    core.setOutput('type', type)
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}

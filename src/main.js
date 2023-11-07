const core = require('@actions/core')
const { groupCommits, generateChangelogString } = require('./generator')
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const commits = JSON.parse(core.getInput('semantic_commits'))

    console.log('commits', commits)
    const mappings = await groupCommits(commits)
    console.log('mappings', mappings)
    const changelog = await generateChangelogString(mappings)
    console.log('Changelog', changelog)
    core.setOutput('changelog', changelog)
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}

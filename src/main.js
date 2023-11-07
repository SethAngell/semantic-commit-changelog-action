const core = require('@actions/core')
const { groupCommits, generateChangelogString } = require('./generator')
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const commits = JSON.parse(core.getInput('semantic_commits'))

    groupCommits(commits)
      .then(mappings => generateChangelogString(mappings))
      .then(changelog => {
        console.log('changelog', changelog)
        core.setOutput('changelog', changelog)
      })
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}

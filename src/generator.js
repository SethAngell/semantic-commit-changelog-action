/**
 * Given a collection of semantic commits, generates a map grouped by commit type.
 *
 * @param {List} commits A list of Semantic Commit objects according to the commit lint format.
 *
 * @returns {Map} Commits mapped by type.
 */
async function groupCommits(commits) {
  const changelog_sections = new Map()
  const parsed_commits = JSON.parse(commits)

  for (const commit of parsed_commits) {
    if (Boolean(commit.valid) !== true) continue
    const commit_type = extractCommitType(commit.message)
    if (changelog_sections.get(commit_type)) {
      const section = changelog_sections.get(commit_type)
      section.items.push(commit.message)
    } else {
      const section = {
        header: getCommitMapping(commit_type),
        items: [commit.message]
      }
      changelog_sections.set(commit_type, section)
    }
  }

  return changelog_sections
}

/**
 * Given a map of semantic commits, generates a valid changelog with commit types grouped under section headers.
 *
 * @param {Map} sections A map of semantic commits, grouped by their type.
 *
 * @returns {String} A markdown valid changelog.
 */
async function generateChangelogString(sections) {
  const changelog_lines = []

  for (const key of commit_mappings.keys()) {
    const section = sections.get(key)
    if (section != null) {
      changelog_lines.push(section.header)
      changelog_lines.push(...section.items)
    }
  }
  return changelog_lines.join('\n')
}

/**
 *  Given a collection of semantic commit messages, determines what the next version should be.
 *
 * @param {List} commits A list of Semantic Commit objects according to the commit lint format.
 *
 * @returns {String} One of the following 3 values, representing types of versions: major, minor, and patch
 */
async function determineHowToVersion(commits) {
  let major = false
  let minor = false

  if (!(commits instanceof Object)) {
    commits = JSON.parse(commits)
  }

  for (const commit of commits) {
    if (testForBreakingChange(commit.message)) {
      major = true
    }
    if (testForMinorChange(commit.message)) {
      minor = true
    }
  }

  if (major) {
    return 'major'
  } else if (minor) {
    return 'minor'
  } else {
    return 'patch'
  }
}

function extractCommitType(branch) {
  const re = /(?<type>[\w-]*)(\(.*\))?:/gm
  const all_groups = re.exec(branch).groups
  const raw_type = all_groups['type']
  const type = raw_type != null ? raw_type.toLocaleLowerCase() : 'fix'
  return commit_mappings.get(type) != null ? type : 'fix'
}

function testForBreakingChange(branch) {
  const header_re = /[a-zA-Z]*(\(.*\))?!:/gm
  const footer_re = /\nBREAKING CHANGES:/gm

  return header_re.test(branch) || footer_re.test(branch)
}

function testForMinorChange(branch) {
  const minor_re = /(feat|refactor)(\(.*\))?:/gm

  return minor_re.test(branch)
}

function getCommitMapping(type) {
  return commit_mappings.get(type) != null ? commit_mappings.get(type) : 'fix'
}

const commit_mappings = new Map([
  ['feat', '\n\n## New Features\n'],
  ['fix', '\n\n## Bug Fixes\n'],
  ['chore', '\n\n## Technical Tasks\n'],
  ['ci', '\n\n## Pipeline Updates\n'],
  ['docs', '\n\n## Documentation\n'],
  ['refactor', '\n\n## Refactors\n'],
  ['test', '\n\n## Testing\n']
])

module.exports = {
  commit_mappings,
  generateChangelogString,
  groupCommits,
  determineHowToVersion
}

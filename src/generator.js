async function groupCommits(commits) {
  const changelog_sections = new Map()
  const parsed_commits = JSON.parse(commits)

  for (const commit of parsed_commits) {
    if (Boolean(commit.valid) !== true) continue
    const commit_type = extractCommitType(commit.message).toLocaleLowerCase()
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

async function generateChangelogString(sections) {
  const changelog_lines = []

  for (const key of Object.keys(commit_mappings)) {
    if (key in sections) {
      const section = sections.get(key)
      changelog_lines.push(section.header)
      changelog_lines.concat(section.items)
    }
  }

  return changelog_lines.join('\n')
}

function extractCommitType(branch) {
  const re = /([a-zA-Z]*)(\(.*\))?:/gm
  const matched_items = branch.match(re)
  console.log(matched_items)
  return matched_items[0]
}

function getCommitMapping(type) {
  console.log('type', type)
  return commit_mappings.get(type) != null ? commit_mappings.get(type) : 'fix'
}

const commit_mappings = new Map([
  ['feat', '## New Features'],
  ['fix', '## Bug Fixes'],
  ['chore', '## Technical Tasks'],
  ['ci', '## Pipeline Updates'],
  ['docs', '## Documentation'],
  ['refactor', '## Refactors'],
  ['test', '## Testing']
])

module.exports = {
  commit_mappings,
  generateChangelogString,
  groupCommits
}

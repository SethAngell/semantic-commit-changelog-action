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

function extractCommitType(branch) {
  const re = /(?<type>[a-zA-Z]*)(\(.*\))?:/gm
  const all_groups = re.exec(branch).groups
  const type = all_groups['type'] != null ? all_groups['type'] : 'fix'
  return type.toLocaleLowerCase()
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
  groupCommits
}

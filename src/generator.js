export async function groupCommits(commits) {
  const changelog_sections = new Map()

  commits
    .filter(commit => commit.valid)
    .forEach(commit => {
      const commit_type = commit.message.split(':')[0].toLocaleLowerCase()
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
    })

  return changelog_sections
}

export async function generateChangelogString(sections) {
  const changelog_lines = []

  Object.keys(commit_mappings).forEach(key => {
    if (key in sections) {
      const section = sections.get(key)
      changelog_lines.push(section.header)
      changelog_lines.concat(section.items)
    }
  })

  return changelog_lines.join('\n')
}

function getCommitMapping(type) {
  return commit_mappings[type] ? commit_mappings[type] : 'fix'
}

export const commit_mappings = {
  feat: '## New Features',
  fix: '## Bug Fixes',
  chore: '## Technical Tasks',
  ci: '## Pipeline Updates',
  docs: '## Documentation',
  refactor: '## Refactors',
  test: '## Testing'
}

const getMockCommits = () => {
  return JSON.parse(
    JSON.stringify([
      {
        hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
        message: 'feat(auth): Added SSO support for Azure',
        valid: true,
        errors: [],
        warnings: []
      },
      {
        hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abd',
        message: 'feat(auth): Added SSO support for Github',
        valid: true,
        errors: [],
        warnings: []
      },
      {
        hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abc',
        message:
          'refactor(database): Updated models to support multi org ownership',
        valid: true,
        errors: [],
        warnings: []
      },
      {
        hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abf',
        message: 'ci(linting): Tried to get linting to work',
        valid: false,
        errors: ['descriptions should not be title case'],
        warnings: []
      },
      {
        hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abg',
        message:
          'test(E2E): set up automated test workflow\n\n- will require followup on gherkings\n',
        valid: true,
        errors: [],
        warnings: []
      }
    ])
  )
}

const getMap = () => {
  const feat_obj = {
    header: '\n\n## New Features\n',
    items: [
      'feat(auth): Added SSO support for Azure',
      'feat(auth): Added SSO support for Github'
    ]
  }
  const refactor_obj = {
    header: '\n\n## Refactors\n',
    items: ['refactor(database): Updated models to support multi org ownership']
  }
  const test_obj = {
    header: '\n\n## Testing\n',
    items: [
      'test(E2E): set up automated test workflow\n' +
        '\n' +
        '- will require followup on gherkings\n'
    ]
  }
  return new Map([
    ['feat', feat_obj],
    ['refactor', refactor_obj],
    ['test', test_obj]
  ])
}

const getChangelog = () => {
  const lines = [
    '\n\n## New Features\n',
    '\nfeat(auth): Added SSO support for Azure',
    '\nfeat(auth): Added SSO support for Github',
    '\n\n## Refactors\n',
    'refactor(database): Updated models to support multi org ownership',
    '\n\n## Testing\n',
    'test(E2E): set up automated test workflow\n',
    '\n',
    '- will require followup on gherkings\n'
  ]

  return lines
}

module.exports = {
  getMockCommits,
  getMap,
  getChangelog
}

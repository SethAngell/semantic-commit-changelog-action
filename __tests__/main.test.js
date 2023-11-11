const core = require('@actions/core')
const main = require('../src/main')

// Mock the GitHub Actions core library
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')
const mockChangelog = '# Changelog'
jest.mock('../src/generator', () => ({
  groupCommits: jest.fn().mockImplementation(() => {
    return new Map()
  }),
  generateChangelogString: jest.fn().mockImplementation(() => {
    return mockChangelog
  }),
  determineHowToVersion: jest.fn().mockImplementation(() => {
    return 'MAJOR'
  })
}))

const singleCommit = JSON.stringify([
  {
    hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
    message: 'feat(auth): Added SSO support for Azure',
    valid: true,
    errors: [],
    warnings: []
  }
])

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets the changelog output', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'semantic_commits':
          return singleCommit
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'changelog',
      expect.stringMatching(mockChangelog)
    )
  })
  it('fails if no input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'semantic_commits':
          throw new Error('no input supplied')
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'no input supplied')
  })
})

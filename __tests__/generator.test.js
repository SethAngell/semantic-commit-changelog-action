/**
 * Unit tests for src/wait.ts
 */
const {
  generateChangelogString,
  groupCommits,
  determineHowToVersion
} = require('../src/generator')
const { getMockCommits, getMap } = require('./helpers/commit_lint')
const { expect } = require('@jest/globals')

describe('Within generators.js', () => {
  describe('when using the groupCommits function', () => {
    it('we should expect that commit categories are sorted into distinct groups', async () => {
      const commits = getMockCommits()
      const mapped_commits = await groupCommits(JSON.stringify(commits))
      expect(Array.from(mapped_commits.keys()).length).toBe(3)
    })
    it('we should expect to see each section to contain all of the messages', async () => {
      const commits = getMockCommits()
      const mapped_commits = await groupCommits(JSON.stringify(commits))
      expect(mapped_commits.get('feat').items.length).toBe(2)
      expect(mapped_commits.get('refactor').items.length).toBe(1)
      expect(mapped_commits.get('test').items.length).toBe(1)
    })
    it('we should expect not to see categories of invalid commits', async () => {
      const commits = getMockCommits()
      const mapped_commits = await groupCommits(JSON.stringify(commits))
      expect(Array.from(mapped_commits.keys()).includes('ci')).toBeFalsy()
    })
    it('should gracefully handle non-standard types and cast them to "fix"', async () => {
      const commits = [
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'fix(auth): added Azure specific config',
          valid: true,
          errors: [],
          warnings: []
        },
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'tech-task(auth): abstracted SSO and Email auth interface',
          valid: true,
          errors: [],
          warnings: []
        }
      ]
      const mapped_commits = await groupCommits(JSON.stringify(commits))
      expect(Array.from(mapped_commits.keys()).length).toBe(1)
      expect(Array.from(mapped_commits.keys()).includes('fix')).toBeTruthy()
    })
  })
  describe('when using the generateChangeLog function', () => {
    it('should combine all of the mapped values into a single string', async () => {
      const mapped_commits = getMap()
      const changelog = await generateChangelogString(mapped_commits)
      expect(changelog).toBeTruthy()
      expect(typeof changelog).toBe('string')
    })
    it('should only generate headers for sections with commits', async () => {
      const mapped_commits = getMap()
      const changelog = await generateChangelogString(mapped_commits)
      const sections = changelog.split('\n\n##')
      let orphanedHeader = false
      sections.forEach(section => {
        if (section != '' && section.split('\n').length === 1) {
          orphanedHeader = true
        }
      })
      expect(orphanedHeader).toBe(false)
    })
  })
  describe('when using the determineHowToVersion function', () => {
    it('should return MAJOR when a commit contains the breaking changes footer', async () => {
      const commits = [
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message:
            'feat(auth): Added SSO support for Azure\nBREAKING CHANGES: auth migration required',
          valid: true,
          errors: [],
          warnings: []
        },
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'fix(auth): abstracted SSO and Email auth interface',
          valid: true,
          errors: [],
          warnings: []
        }
      ]

      const version_type = await determineHowToVersion(commits)

      expect(version_type).toBe('major')
    })
    it('should return MAJOR when a commit type and/or scope is followed by an exclamation point', async () => {
      const commits = [
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'feat!: Added SSO support for Azure',
          valid: true,
          errors: [],
          warnings: []
        },
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'fix(auth): abstracted SSO and Email auth interface',
          valid: true,
          errors: [],
          warnings: []
        },
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'feat(auth)!: Added SSO support for Azure',
          valid: true,
          errors: [],
          warnings: []
        }
      ]

      const unscoped_type = await determineHowToVersion(commits.slice(2))
      const scoped_type = await determineHowToVersion(commits.slice(-2))

      expect(unscoped_type).toBe('major')
      expect(scoped_type).toBe('major')
    })
    it('should return MINOR when a commit contains feat or refactor tags', async () => {
      const commits = [
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'feat(auth): added SSO support for Azure',
          valid: true,
          errors: [],
          warnings: []
        },
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'fix(auth): added Azure specific config',
          valid: true,
          errors: [],
          warnings: []
        },
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'refactor(auth): abstracted SSO and Email auth interface',
          valid: true,
          errors: [],
          warnings: []
        }
      ]

      const feat_type = await determineHowToVersion(commits.slice(2))
      const refactor_type = await determineHowToVersion(commits.slice(-2))

      expect(feat_type).toBe('minor')
      expect(refactor_type).toBe('minor')
    })
    it('should return PATCH when no feat or refactor tags are present', async () => {
      const commits = [
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'fix(auth): added Azure specific config',
          valid: true,
          errors: [],
          warnings: []
        },
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'fix(auth): abstracted SSO and Email auth interface',
          valid: true,
          errors: [],
          warnings: []
        }
      ]

      const patch_type = await determineHowToVersion(commits)
      expect(patch_type).toBe('patch')
    })
    it('should gracefully handle stringifed input', async () => {
      const commits = JSON.stringify([
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'fix(auth): added Azure specific config',
          valid: true,
          errors: [],
          warnings: []
        },
        {
          hash: 'dc638790213bc16f081fa6b78bb9eaafcb564abe',
          message: 'fix(auth): abstracted SSO and Email auth interface',
          valid: true,
          errors: [],
          warnings: []
        }
      ])

      const patch_type = await determineHowToVersion(commits)
      expect(patch_type).toBe('patch')
    })
  })
})

/**
 * Unit tests for src/wait.ts
 */
const { generateChangelogString, groupCommits } = require('../src/generator')
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
})

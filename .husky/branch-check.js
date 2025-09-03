#!/usr/bin/env node
const { execSync } = require('child_process')

try {
	const currentBranch = execSync('git rev-parse --abbrev-ref HEAD')
		.toString()
		.trim()
	const protectedBranches = ['main', 'master']

	if (protectedBranches.includes(currentBranch)) {
		console.log('')
		console.log(
			"🚫 ERROR: Direct commits to '" +
				currentBranch +
				"' branch are not allowed!",
		)
		console.log('')
		console.log('To fix this:')
		console.log(
			'1. Create a new branch: git checkout -b feature/your-feature-name',
		)
		console.log(
			'2. Or switch to existing branch: git checkout your-branch-name',
		)
		console.log('3. Make your changes and commit')
		console.log('4. Push your branch: git push origin your-branch-name')
		console.log('5. Create a Pull Request on GitHub')
		console.log('')
		console.log(
			"💡 Tip: Use 'git stash' to save your current changes before switching branches",
		)
		console.log('')
		process.exit(1)
	}

	console.log(
		"✅ Branch check passed: Working on '" + currentBranch + "' branch",
	)
} catch (error) {
	console.error('Error checking branch:', error.message)
	process.exit(1)
}

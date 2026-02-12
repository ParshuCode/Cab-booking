# Git Pull Guide - Syncing Changes from ParshuCode/Cab-booking

## Overview

This guide explains how to pull changes from **ParshuCode/Cab-booking** (upstream) back to your local repository after you've made changes there.

---

## Current Repository Setup

- **Local Repository:** D:\SynProject\Cab_Booking\Cab-booking
- **Origin (Your Fork):** https://github.com/ritikraushan08/Cab-booking.git
- **Upstream (ParshuCode):** https://github.com/ParshuCode/Cab-booking

---

## Workflow Scenarios

### Scenario 1: Pull Changes from Upstream Main Branch

If changes were made to the main branch in ParshuCode/Cab-booking:

```bash
# 1. Switch to your main branch
git checkout main

# 2. Fetch latest changes from upstream
git fetch upstream

# 3. Merge upstream changes into your local main
git merge upstream/main

# Or use pull (fetch + merge in one command)
git pull upstream main

# 4. Push updated main to your fork (optional)
git push origin main
```

---

### Scenario 2: Pull Changes from Upstream Payment Branch

If changes were made to the Payment branch in ParshuCode/Cab-booking:

```bash
# 1. Switch to your Payment branch
git checkout Payment

# 2. Fetch latest changes from upstream
git fetch upstream

# 3. Merge upstream Payment branch into your local Payment branch
git merge upstream/Payment

# Or use pull
git pull upstream Payment

# 4. Push updated Payment branch to your fork (optional)
git push origin Payment
```

---

### Scenario 3: Pull Changes from Any Specific Branch

```bash
# 1. Fetch all branches from upstream
git fetch upstream

# 2. Switch to the branch you want to update
git checkout <branch-name>

# 3. Pull changes from upstream branch
git pull upstream <branch-name>

# 4. Push to your fork (optional)
git push origin <branch-name>
```

---

## Complete Step-by-Step Guide

### Step 1: Check Your Current Branch
```bash
git branch
```

### Step 2: Fetch All Changes from Upstream
```bash
git fetch upstream
```

This downloads all changes from ParshuCode/Cab-booking without merging them.

### Step 3: View Available Branches
```bash
# View all remote branches
git branch -r

# View upstream branches specifically
git branch -r | grep upstream
```

### Step 4: Pull Changes

**Option A: Pull to Current Branch**
```bash
# Make sure you're on the correct branch
git checkout Payment

# Pull changes from upstream Payment branch
git pull upstream Payment
```

**Option B: Pull to Main Branch**
```bash
git checkout main
git pull upstream main
```

### Step 5: Resolve Conflicts (if any)

If there are conflicts:

```bash
# Git will show which files have conflicts
# Edit the conflicted files manually

# After resolving conflicts, add them
git add <conflicted-file>

# Complete the merge
git commit -m "Merge changes from upstream"
```

### Step 6: Push to Your Fork (Optional)
```bash
# Push to your fork to keep it in sync
git push origin Payment
```

---

## Quick Commands Reference

### Pull Latest Changes from Upstream Main
```bash
git checkout main
git pull upstream main
git push origin main
```

### Pull Latest Changes from Upstream Payment Branch
```bash
git checkout Payment
git pull upstream Payment
git push origin Payment
```

### Fetch and View Changes Before Merging
```bash
# Fetch changes
git fetch upstream

# View what changed
git log HEAD..upstream/Payment

# View differences
git diff HEAD..upstream/Payment

# Merge when ready
git merge upstream/Payment
```

---

## Syncing Workflow (Recommended)

### Daily Sync Routine

```bash
# 1. Fetch all changes from upstream
git fetch upstream

# 2. Switch to main branch
git checkout main

# 3. Merge upstream main
git merge upstream/main

# 4. Switch to Payment branch
git checkout Payment

# 5. Merge upstream Payment
git merge upstream/Payment

# 6. Push to your fork
git push origin main
git push origin Payment
```

---

## Advanced: Rebase Instead of Merge

If you prefer a cleaner history:

```bash
# Switch to your branch
git checkout Payment

# Fetch latest changes
git fetch upstream

# Rebase your changes on top of upstream
git rebase upstream/Payment

# Force push to your fork (use carefully!)
git push origin Payment --force
```

**⚠️ Warning:** Only use `--force` if you're sure no one else is working on your fork.

---

## Handling Specific Scenarios

### Scenario A: You Made Local Changes, Need to Pull

```bash
# Option 1: Stash your changes
git stash
git pull upstream Payment
git stash pop

# Option 2: Commit your changes first
git add .
git commit -m "WIP: Local changes"
git pull upstream Payment
```

### Scenario B: Pull Specific File from Upstream

```bash
# Fetch changes
git fetch upstream

# Checkout specific file from upstream
git checkout upstream/Payment -- path/to/file

# Commit the change
git commit -m "Update file from upstream"
```

### Scenario C: Pull and Overwrite Local Changes

```bash
# Fetch changes
git fetch upstream

# Reset your branch to match upstream (⚠️ destroys local changes)
git reset --hard upstream/Payment
```

---

## Verification Commands

### Check if You're Up to Date
```bash
# Fetch latest
git fetch upstream

# Compare your branch with upstream
git status

# View commits in upstream that you don't have
git log HEAD..upstream/Payment

# View commits you have that upstream doesn't
git log upstream/Payment..HEAD
```

### View Remote Branches
```bash
# List all remote branches
git branch -r

# Show remote details
git remote -v

# Show upstream branches
git ls-remote --heads upstream
```

---

## Troubleshooting

### Issue: "Your branch is behind 'upstream/Payment'"

**Solution:**
```bash
git pull upstream Payment
```

### Issue: Merge Conflicts

**Solution:**
```bash
# View conflicted files
git status

# Edit files to resolve conflicts
# Look for <<<<<<< HEAD markers

# After resolving
git add <resolved-files>
git commit -m "Resolved merge conflicts"
```

### Issue: "fatal: refusing to merge unrelated histories"

**Solution:**
```bash
git pull upstream Payment --allow-unrelated-histories
```

### Issue: Accidentally Pulled Wrong Branch

**Solution:**
```bash
# Undo the merge (before committing)
git merge --abort

# Or reset to previous state
git reset --hard HEAD@{1}
```

---

## Best Practices

### 1. Always Fetch Before Pull
```bash
git fetch upstream
git status
git pull upstream Payment
```

### 2. Keep Your Fork in Sync
```bash
# Regularly sync your fork with upstream
git checkout main
git pull upstream main
git push origin main
```

### 3. Create Feature Branches
```bash
# Don't work directly on main or Payment
git checkout -b feature/my-feature
# Make changes
git commit -m "Add feature"
git push origin feature/my-feature
```

### 4. Pull Before Push
```bash
# Always pull latest before pushing
git pull upstream Payment
git push origin Payment
```

---

## Complete Workflow Example

### Example: Syncing After Changes in ParshuCode

```bash
# 1. Check current status
git status
git branch

# 2. Fetch all changes from ParshuCode
git fetch upstream

# 3. Switch to Payment branch
git checkout Payment

# 4. Pull changes from upstream Payment
git pull upstream Payment

# 5. Resolve any conflicts if they occur
# (Edit files, then git add and git commit)

# 6. Verify everything is good
git status
git log --oneline -5

# 7. Push to your fork
git push origin Payment

# 8. Continue working
```

---

## Automated Sync Script

Create a file `sync-upstream.sh`:

```bash
#!/bin/bash

echo "🔄 Syncing with ParshuCode/Cab-booking..."

# Fetch all changes
git fetch upstream

# Sync main branch
echo "📥 Syncing main branch..."
git checkout main
git merge upstream/main
git push origin main

# Sync Payment branch
echo "📥 Syncing Payment branch..."
git checkout Payment
git merge upstream/Payment
git push origin Payment

echo "✅ Sync complete!"
```

Run with:
```bash
bash sync-upstream.sh
```

---

## Quick Reference Table

| Command | Purpose |
|---------|---------|
| `git fetch upstream` | Download changes without merging |
| `git pull upstream Payment` | Fetch and merge Payment branch |
| `git pull upstream main` | Fetch and merge main branch |
| `git merge upstream/Payment` | Merge upstream Payment into current branch |
| `git rebase upstream/Payment` | Rebase current branch on upstream |
| `git push origin Payment` | Push to your fork |
| `git status` | Check sync status |
| `git log HEAD..upstream/Payment` | View upstream commits you don't have |

---

## Summary

**To pull changes from ParshuCode/Cab-booking:**

```bash
# Quick version
git fetch upstream
git checkout Payment
git pull upstream Payment

# With verification
git fetch upstream
git checkout Payment
git log HEAD..upstream/Payment  # See what's new
git pull upstream Payment       # Pull changes
git push origin Payment         # Update your fork
```

---

## Need Help?

- Check `git status` to see current state
- Use `git log` to view commit history
- Run `git fetch upstream` regularly to stay updated
- Always commit or stash local changes before pulling

---

**Remember:** 
- `upstream` = ParshuCode/Cab-booking (source of truth)
- `origin` = ritikraushan08/Cab-booking (your fork)
- Always pull from `upstream`, push to `origin`

✅ **You're all set to sync changes!**

# Quick Pull Commands - Most Common Scenarios

## Scenario: Pull Latest Changes from ParshuCode Payment Branch

### Commands to Run:
```bash
# 1. Fetch all changes
git fetch upstream

# 2. Switch to Payment branch
git checkout Payment

# 3. Pull changes from ParshuCode Payment branch
git pull upstream Payment

# 4. Push to your fork (optional, keeps your fork in sync)
git push origin Payment
```

---

## Scenario: Pull Latest Changes from ParshuCode Main Branch

### Commands to Run:
```bash
# 1. Fetch all changes
git fetch upstream

# 2. Switch to main branch
git checkout main

# 3. Pull changes from ParshuCode main branch
git pull upstream main

# 4. Push to your fork (optional)
git push origin main
```

---

## One-Line Commands

### Pull Payment Branch:
```bash
git fetch upstream && git checkout Payment && git pull upstream Payment
```

### Pull Main Branch:
```bash
git fetch upstream && git checkout main && git pull upstream main
```

---

## Before You Pull - Check What's New

### See what changes are in ParshuCode that you don't have:
```bash
# Fetch first
git fetch upstream

# View commits in upstream Payment that you don't have
git log HEAD..upstream/Payment --oneline

# View detailed differences
git diff HEAD..upstream/Payment
```

---

## After You Pull - Verify

### Check that pull was successful:
```bash
# Check status
git status

# View recent commits
git log --oneline -5

# Verify you're up to date
git fetch upstream
git status
```

Should show: "Your branch is up to date with 'upstream/Payment'"

---

## If You Have Local Changes

### Option 1: Stash, Pull, Then Apply
```bash
# Save your local changes
git stash

# Pull from upstream
git pull upstream Payment

# Reapply your changes
git stash pop
```

### Option 2: Commit First, Then Pull
```bash
# Commit your local changes
git add .
git commit -m "WIP: Local changes"

# Pull from upstream
git pull upstream Payment
```

---

## Complete Workflow

```bash
# 1. Save any local work
git status
git add .
git commit -m "Save local changes"

# 2. Fetch from ParshuCode
git fetch upstream

# 3. Pull Payment branch
git checkout Payment
git pull upstream Payment

# 4. Update your fork
git push origin Payment

# 5. Verify
git status
```

---

## Quick Reference

| What You Want | Command |
|---------------|---------|
| Pull Payment branch | `git pull upstream Payment` |
| Pull main branch | `git pull upstream main` |
| See what's new | `git log HEAD..upstream/Payment` |
| Check status | `git status` |
| Update your fork | `git push origin Payment` |

---

## Remember

- **upstream** = ParshuCode/Cab-booking (where you push changes)
- **origin** = ritikraushan08/Cab-booking (your fork)
- Always **fetch** before pull to see what's coming
- Always **commit or stash** local changes before pulling

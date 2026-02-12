# Git Workflow - Complete Guide

## 🔄 Your Git Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ParshuCode/Cab-booking                    │
│                  (Upstream Repository)                       │
│                                                              │
│  Branches: main, Payment                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ git push upstream Payment
                       │ (You push your changes here)
                       │
                       │ git pull upstream Payment
                       │ (You pull changes from here)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Your Local Repository                           │
│         D:\SynProject\Cab_Booking\Cab-booking               │
│                                                              │
│  Branches: main, Payment                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ git push origin Payment
                       │ (Backup to your fork)
                       │
                       │ git pull origin Payment
                       │ (Pull from your fork)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              ritikraushan08/Cab-booking                      │
│                  (Your Fork - Origin)                        │
│                                                              │
│  Branches: main, Payment                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📤 Push Workflow (Your Changes → ParshuCode)

```
┌─────────────────┐
│ Make Changes    │
│ in Local Repo   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ git add .       │
│ git commit -m   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ git push upstream       │
│ Payment                 │
│                         │
│ (Sends to ParshuCode)   │
└─────────────────────────┘
```

**Commands:**
```bash
git add payment-service/
git commit -m "feat: Add payment service"
git push upstream Payment
```

---

## 📥 Pull Workflow (ParshuCode Changes → Your Local)

```
┌─────────────────────────┐
│ Changes made in         │
│ ParshuCode/Cab-booking  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ git fetch upstream      │
│                         │
│ (Download changes)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ git checkout Payment    │
│                         │
│ (Switch to branch)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ git pull upstream       │
│ Payment                 │
│                         │
│ (Merge changes)         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Changes now in          │
│ Your Local Repo         │
└─────────────────────────┘
```

**Commands:**
```bash
git fetch upstream
git checkout Payment
git pull upstream Payment
```

---

## 🔄 Complete Sync Workflow

### Step 1: Pull Latest from ParshuCode
```bash
git fetch upstream
git checkout Payment
git pull upstream Payment
```

### Step 2: Make Your Changes
```bash
# Edit files
# Add new features
```

### Step 3: Commit Changes
```bash
git add .
git commit -m "Your commit message"
```

### Step 4: Push to ParshuCode
```bash
git push upstream Payment
```

### Step 5: (Optional) Backup to Your Fork
```bash
git push origin Payment
```

---

## 🎯 Daily Workflow

### Morning: Sync with Latest Changes
```bash
# Get latest from ParshuCode
git fetch upstream
git checkout Payment
git pull upstream Payment
```

### During Day: Work on Features
```bash
# Make changes
# Test your code
git add .
git commit -m "feat: Add new feature"
```

### Evening: Push Your Work
```bash
# Push to ParshuCode
git push upstream Payment

# Backup to your fork
git push origin Payment
```

---

## 🔀 Branch Workflow

### Working on Payment Branch
```bash
# Switch to Payment branch
git checkout Payment

# Pull latest
git pull upstream Payment

# Make changes
# ... edit files ...

# Commit
git add .
git commit -m "Update payment service"

# Push
git push upstream Payment
```

### Working on Main Branch
```bash
# Switch to main
git checkout main

# Pull latest
git pull upstream main

# Make changes
# ... edit files ...

# Commit
git add .
git commit -m "Update main"

# Push
git push upstream main
```

---

## 🚨 Handling Conflicts

### If Pull Shows Conflicts:

```bash
# 1. Pull shows conflicts
git pull upstream Payment
# CONFLICT (content): Merge conflict in file.txt

# 2. View conflicted files
git status

# 3. Edit files to resolve conflicts
# Look for <<<<<<< HEAD markers
# Choose which changes to keep

# 4. Mark as resolved
git add <conflicted-file>

# 5. Complete the merge
git commit -m "Resolved merge conflicts"

# 6. Push
git push upstream Payment
```

---

## 📊 Check Status Commands

### Before Pull - See What's New
```bash
git fetch upstream
git log HEAD..upstream/Payment --oneline
```

### After Pull - Verify Success
```bash
git status
# Should show: "Your branch is up to date"
```

### Check All Branches
```bash
git branch -a
```

---

## 🎓 Common Scenarios

### Scenario 1: Someone Else Pushed to ParshuCode
**What to do:** Pull their changes before pushing yours
```bash
git pull upstream Payment
git push upstream Payment
```

### Scenario 2: You Pushed, Now Want to Pull Updates
**What to do:** Just pull normally
```bash
git pull upstream Payment
```

### Scenario 3: You Have Local Uncommitted Changes
**What to do:** Stash, pull, then apply
```bash
git stash
git pull upstream Payment
git stash pop
```

### Scenario 4: You Want to Discard Local Changes
**What to do:** Reset to upstream
```bash
git fetch upstream
git reset --hard upstream/Payment
```

---

## 🔧 Useful Commands

### View Remote Repositories
```bash
git remote -v
```

Output:
```
origin    https://github.com/ritikraushan08/Cab-booking.git (fetch)
origin    https://github.com/ritikraushan08/Cab-booking.git (push)
upstream  https://github.com/ParshuCode/Cab-booking (fetch)
upstream  https://github.com/ParshuCode/Cab-booking (push)
```

### View All Branches
```bash
git branch -a
```

### View Commit History
```bash
git log --oneline --graph --all -10
```

### Compare Branches
```bash
git diff upstream/Payment
```

---

## ✅ Quick Checklist

### Before You Start Working:
- [ ] `git fetch upstream`
- [ ] `git pull upstream Payment`
- [ ] `git status` (should be clean)

### Before You Push:
- [ ] `git status` (check what's changed)
- [ ] `git add .`
- [ ] `git commit -m "message"`
- [ ] `git pull upstream Payment` (get latest)
- [ ] `git push upstream Payment`

### End of Day:
- [ ] Commit all changes
- [ ] Push to upstream
- [ ] Backup to origin (your fork)

---

## 📝 Summary

**To Push Your Changes:**
```bash
git add .
git commit -m "Your message"
git push upstream Payment
```

**To Pull Others' Changes:**
```bash
git fetch upstream
git pull upstream Payment
```

**To Stay in Sync:**
```bash
# Pull before you start
git pull upstream Payment

# Push when you're done
git push upstream Payment
```

---

## 🎯 Remember

- **Always pull before push** to avoid conflicts
- **Commit often** with meaningful messages
- **Push regularly** to backup your work
- **Fetch first** to see what's new

---

**Your Remotes:**
- `upstream` = ParshuCode/Cab-booking ✅ (main repository)
- `origin` = ritikraushan08/Cab-booking (your backup fork)

**Your Branches:**
- `main` = Main development branch
- `Payment` = Payment service feature branch

---

✅ **You're all set! Happy coding!** 🚀

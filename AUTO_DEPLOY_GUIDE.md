# Automatic GitHub Deployment Guide 🚀

This guide will help you set up automatic deployment so that every time you push code to GitHub, Render automatically updates your live app!

## What You'll Get:

✅ **Automatic deployments** - Push to GitHub → Render auto-deploys
✅ **Version control** - Track all your changes
✅ **Easy updates** - Just run one script to push updates
✅ **Rollback capability** - Revert to previous versions if needed

---

## Initial Setup (One-Time)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `dark-midi-generator`
3. Make it **Public** (or Private, your choice)
4. **Don't** check "Initialize with README"
5. Click "Create repository"

### Step 2: Set Up Git Locally

**On Mac/Linux:**
```bash
cd dark-midi-generator
./setup-github.sh
```

**On Windows:**
```
cd dark-midi-generator
setup-github.bat
```

The script will:
- Configure git with your username and email
- Initialize the repository
- Add all your files
- Connect to GitHub
- Push your code

**First time?** You might need to authenticate with GitHub:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password!)
  - Create token at: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Select scopes: `repo` (full control)
  - Copy the token and use it as your password

### Step 3: Connect Render to GitHub

1. Go to https://render.com and log in
2. Click "New +" → "Web Service"
3. Click "Connect account" next to GitHub
4. Authorize Render to access your repositories
5. Find `dark-midi-generator` and click "Connect"
6. Configure:
   - **Name**: dark-midi-generator
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
7. Add environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: [your API key]
8. Click "Create Web Service"

**Done!** Render is now watching your GitHub repo.

---

## Making Updates (Anytime)

Whenever you want to update your live app:

### Method 1: Quick Update Script (Easiest)

**Mac/Linux:**
```bash
./update.sh
```

**Windows:**
```
update.bat
```

That's it! Your changes are pushed to GitHub and Render will auto-deploy in ~2 minutes.

### Method 2: Manual Git Commands

```bash
git add .
git commit -m "Your update message"
git push
```

---

## What Happens After You Push:

1. **GitHub receives your code** (instant)
2. **Render detects the change** (5-10 seconds)
3. **Render starts building** (shows in logs)
4. **Render installs dependencies** (`npm install`)
5. **Render starts your server** (`node server.js`)
6. **Your app is live!** (total: ~2 minutes)

You can watch the deployment in real-time:
- Go to your service in Render
- Click "Logs" tab
- Watch it build and deploy

---

## Common Workflows

### Updating server.js:

1. Edit `server.js` locally
2. Run `./update.sh` (or `update.bat`)
3. Wait 2 minutes
4. Test your live app

### Updating frontend:

1. Edit files in `public/` folder
2. Run `./update.sh`
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Adding new features:

1. Make your changes
2. Test locally: `npm start`
3. If it works, run `./update.sh`
4. Render auto-deploys

---

## Troubleshooting

**"fatal: not a git repository"**
- Run `./setup-github.sh` first

**"Authentication failed"**
- Use a Personal Access Token, not your password
- Create one at: https://github.com/settings/tokens

**"remote: Repository not found"**
- Make sure you created the repository on GitHub first
- Check the repository name matches

**Render not auto-deploying:**
- Check Render is connected to the correct repo
- Go to Settings → check "Auto-Deploy" is enabled

**Build failing on Render:**
- Check the logs in Render
- Make sure all files are pushed to GitHub
- Verify `package.json` is present

---

## Viewing Deploy History

On Render:
1. Go to your service
2. Click "Events" tab
3. See all your deployments
4. Click any to see logs
5. Can rollback to any previous version

---

## Best Practices

✅ **Test locally first** - Run `npm start` and test before pushing
✅ **Commit often** - Small, frequent commits are better
✅ **Use descriptive messages** - "Fix JSON parsing bug" not "update"
✅ **Check logs** - Always check Render logs after deploying
✅ **Keep .env private** - Never commit your `.env` file

---

## File Structure

```
dark-midi-generator/
├── server.js              # Backend code
├── package.json           # Dependencies
├── public/
│   └── index.html        # Frontend
├── .gitignore            # Files to ignore
├── setup-github.sh       # Initial setup (Mac/Linux)
├── setup-github.bat      # Initial setup (Windows)
├── update.sh             # Quick update (Mac/Linux)
└── update.bat            # Quick update (Windows)
```

---

## Pro Tips

💡 **Branch for experiments:**
```bash
git checkout -b experiment
# Make changes
git push -u origin experiment
```
Render only deploys from `main` branch by default.

💡 **Quick rollback:**
Go to Render → "Manual Deploy" → Select previous commit

💡 **View live logs:**
```bash
# Install Render CLI
npm install -g @render/cli
# View logs
render logs -f
```

---

## Summary

**To set up (one time):**
1. Create GitHub repo
2. Run `./setup-github.sh`
3. Connect Render to GitHub

**To update (anytime):**
1. Make changes
2. Run `./update.sh`
3. Wait 2 minutes
4. Your app is updated!

That's it! You now have automatic deployments. 🎉

---

Need help? Check:
- Render docs: https://render.com/docs
- GitHub docs: https://docs.github.com
- Or ask me!

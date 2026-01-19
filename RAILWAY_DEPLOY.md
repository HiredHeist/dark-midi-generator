# Deploy to Railway - Step by Step Guide 🚂

## Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)
- Your Anthropic API key

## Deployment Steps

### Step 1: Prepare Your Code

1. **Create a GitHub repository:**
   - Go to https://github.com/new
   - Name it: `dark-midi-generator`
   - Make it public or private (your choice)
   - Don't initialize with README (we already have one)

2. **Upload your code to GitHub:**
   
   **Option A - Using Git (Recommended):**
   ```bash
   # Extract the archive if you haven't already
   tar -xzf dark-midi-generator.tar.gz
   cd dark-midi-generator
   
   # Initialize git
   git init
   git add .
   git commit -m "Initial commit"
   
   # Connect to your GitHub repo (replace with your username/repo)
   git remote add origin https://github.com/YOUR_USERNAME/dark-midi-generator.git
   git branch -M main
   git push -u origin main
   ```
   
   **Option B - Using GitHub Web Interface:**
   - Extract the archive
   - Go to your new GitHub repo
   - Click "uploading an existing file"
   - Drag and drop all files EXCEPT:
     - `node_modules/` folder (if it exists)
     - `.env` file (never upload this!)
   - Commit the files

### Step 2: Deploy on Railway

1. **Go to Railway:**
   - Visit https://railway.app
   - Click "Login" and sign in with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `dark-midi-generator` repository
   - Click "Deploy Now"

3. **Configure Environment Variables:**
   - Click on your deployed service
   - Go to the "Variables" tab
   - Click "+ New Variable"
   - Add:
     ```
     ANTHROPIC_API_KEY=your_actual_api_key_here
     ```
   - Click "Add"

4. **Wait for Deployment:**
   - Railway will automatically:
     - Detect it's a Node.js app
     - Run `npm install`
     - Start the server with `npm start`
   - Wait 2-3 minutes for the build to complete

5. **Get Your URL:**
   - Go to the "Settings" tab
   - Scroll to "Networking"
   - Click "Generate Domain"
   - You'll get a URL like: `https://your-app.up.railway.app`

### Step 3: Test Your Deployment

1. Visit your Railway URL
2. You should see the Dark MIDI Generator interface
3. Try generating a track to confirm it works!

## Alternative: Deploy Without GitHub

If you don't want to use GitHub:

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Initialize and deploy:
   ```bash
   cd dark-midi-generator
   railway init
   railway up
   ```

4. Set environment variable:
   ```bash
   railway variables set ANTHROPIC_API_KEY=your_api_key_here
   ```

5. Get your URL:
   ```bash
   railway domain
   ```

## Troubleshooting

**Build fails:**
- Check the logs in Railway dashboard
- Make sure all files are uploaded correctly
- Verify `package.json` has correct dependencies

**"API key not configured" error:**
- Go to Variables tab in Railway
- Make sure `ANTHROPIC_API_KEY` is set correctly
- Redeploy if needed (Settings → Redeploy)

**App not loading:**
- Check if the deployment succeeded (green checkmark)
- Look at the logs for errors
- Make sure you generated a domain

**CORS errors:**
- This shouldn't happen as CORS is enabled
- If it does, check the Railway logs

## Cost

Railway offers:
- **Hobby Plan**: $5/month (500 hours of usage)
- **Free Trial**: $5 credit to start

Your app uses minimal resources, so $5/month should be plenty.

## Updating Your App

When you want to make changes:

1. Update your local files
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```
3. Railway auto-deploys the changes!

## Custom Domain (Optional)

Want your own domain like `darkmusic.com`?

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In Railway Settings → Networking
3. Click "Custom Domain"
4. Follow the DNS setup instructions

---

## Need Help?

If you run into issues:
1. Check Railway logs (they're very helpful!)
2. Check Railway's documentation: https://docs.railway.app
3. Ask me for help!

🎸 Happy deploying! 🤘

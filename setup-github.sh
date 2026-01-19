#!/bin/bash

# Dark MIDI Generator - GitHub Setup Script
# This script will set up git and push your code to GitHub

echo "🎸 Dark MIDI Generator - GitHub Setup"
echo "======================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Get repository name
read -p "Enter your repository name (default: dark-midi-generator): " REPO_NAME
REPO_NAME=${REPO_NAME:-dark-midi-generator}

# Get GitHub email
read -p "Enter your GitHub email: " GITHUB_EMAIL

# Configure git
echo ""
echo "📝 Configuring git..."
git config --global user.name "$GITHUB_USERNAME"
git config --global user.email "$GITHUB_EMAIL"

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "🔧 Initializing git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary files
tmp/
temp/
EOF
    echo "✅ .gitignore created"
fi

# Stage all files
echo "📦 Staging files..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "ℹ️  No changes to commit"
else
    # Commit
    echo "💾 Committing changes..."
    git commit -m "Update Dark MIDI Generator"
    echo "✅ Changes committed"
fi

# Check if remote exists
if git remote get-url origin &> /dev/null; then
    echo "ℹ️  Remote 'origin' already exists"
else
    # Add remote
    echo "🔗 Adding GitHub remote..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "✅ Remote added"
fi

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
echo "Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

# Try to push
if git push -u origin $BRANCH; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your code is now on GitHub!"
    echo "📍 Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://render.com"
    echo "2. Create a new Web Service"
    echo "3. Connect your GitHub repository"
    echo "4. Render will auto-deploy on every push!"
else
    echo ""
    echo "⚠️  Push failed. This might be because:"
    echo "   - The repository doesn't exist on GitHub yet"
    echo "   - You need to authenticate with GitHub"
    echo ""
    echo "To fix:"
    echo "1. Create the repository on GitHub: https://github.com/new"
    echo "2. Name it: $REPO_NAME"
    echo "3. Run this command manually:"
    echo ""
    echo "   git push -u origin $BRANCH"
    echo ""
    echo "If you need to authenticate, GitHub will prompt you."
fi

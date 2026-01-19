#!/bin/bash

# Dark MIDI Generator - Quick Update Script
# Run this anytime you want to push updates to GitHub

echo "🎸 Pushing updates to GitHub..."

# Stage all changes
git add .

# Check if there are changes
if git diff-index --quiet HEAD --; then
    echo "✅ No changes to push"
    exit 0
fi

# Commit with timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m "Update: $TIMESTAMP"

# Push to GitHub
git push

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🚀 Render will auto-deploy in ~2 minutes"
else
    echo "❌ Push failed. Please check your connection and credentials."
    exit 1
fi

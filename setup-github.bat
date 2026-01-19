@echo off
REM Dark MIDI Generator - GitHub Setup Script (Windows)

echo ========================================
echo Dark MIDI Generator - GitHub Setup
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Git is not installed. Please install git first.
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Get GitHub username
set /p GITHUB_USERNAME="Enter your GitHub username: "

REM Get repository name
set /p REPO_NAME="Enter your repository name (default: dark-midi-generator): "
if "%REPO_NAME%"=="" set REPO_NAME=dark-midi-generator

REM Get GitHub email
set /p GITHUB_EMAIL="Enter your GitHub email: "

REM Configure git
echo.
echo Configuring git...
git config --global user.name "%GITHUB_USERNAME%"
git config --global user.email "%GITHUB_EMAIL%"

REM Initialize git if not already initialized
if not exist .git (
    echo Initializing git repository...
    git init
    echo Git initialized
) else (
    echo Git already initialized
)

REM Stage all files
echo Staging files...
git add .

REM Commit
echo Committing changes...
git commit -m "Initial commit"

REM Check if remote exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo Adding GitHub remote...
    git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
    echo Remote added
) else (
    echo Remote already exists
)

REM Push to GitHub
echo.
echo Pushing to GitHub...
echo Repository: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo Successfully pushed to GitHub!
    echo.
    echo Your code is now on GitHub!
    echo Repository: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
    echo.
    echo Next steps:
    echo 1. Go to https://render.com
    echo 2. Create a new Web Service
    echo 3. Connect your GitHub repository
    echo 4. Render will auto-deploy on every push!
) else (
    echo.
    echo Push failed. This might be because:
    echo - The repository doesn't exist on GitHub yet
    echo - You need to authenticate with GitHub
    echo.
    echo To fix:
    echo 1. Create the repository on GitHub: https://github.com/new
    echo 2. Name it: %REPO_NAME%
    echo 3. Run this script again
)

echo.
pause

@echo off
REM Dark MIDI Generator - Quick Update Script (Windows)

echo Pushing updates to GitHub...

REM Stage all changes
git add .

REM Commit with timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
git commit -m "Update: %mydate% %mytime%"

REM Push to GitHub
git push

if %errorlevel% equ 0 (
    echo Successfully pushed to GitHub!
    echo Render will auto-deploy in ~2 minutes
) else (
    echo Push failed. Please check your connection and credentials.
)

pause

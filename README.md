# Dark MIDI Generator 🎸⚡

AI-powered MIDI stem generation for doom metal, industrial, and dungeon synth genres.

## Features

- 🎵 **AI-Powered Generation**: Uses Claude AI to create genre-specific MIDI compositions
- 🎛️ **Multiple Genres**: Doom Metal, Industrial, and Dungeon Synth
- 🎚️ **Customizable BPM**: Range from 40 (ultra slow) to 180 BPM
- 🎹 **Individual Stems**: Separate MIDI files for each instrument
- 🔊 **Live Preview**: Browser-based audio playback with Web Audio API
- 🔇 **Mute/Unmute**: Solo or mute individual stems during preview
- 🔄 **Remake Function**: Regenerate any stem that doesn't sound right
- 📥 **Export**: Download individual stems or complete MIDI files

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Anthropic API key ([get one here](https://console.anthropic.com/))

## Installation

1. **Clone or download the project files**

2. **Install dependencies:**
```bash
npm install
```

3. **Set up your API key:**

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Then edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
PORT=3000
```

## Running the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

1. Open your browser to `http://localhost:3000`
2. Select a genre (Doom Metal, Industrial, or Dungeon Synth)
3. Set your desired BPM using the slider
4. Write a prompt describing your track (e.g., "Crushing riff in drop C with haunting melody")
5. Click "Generate MIDI Stems"
6. Preview the track using the play button
7. Mute/unmute individual stems to hear them isolated
8. Remake any stem that doesn't sound good
9. Download individual stems or the complete MIDI file

## Project Structure

```
dark-midi-generator/
├── server.js           # Express backend with Anthropic API integration
├── package.json        # Node.js dependencies
├── .env               # API keys and configuration (create this)
├── .env.example       # Example environment variables
└── public/
    └── index.html     # Frontend React application
```

## API Endpoints

### POST /api/generate
Generate complete MIDI stems for a composition.

**Request Body:**
```json
{
  "genre": "doom-metal",
  "bpm": 80,
  "prompt": "Heavy crushing riff with dark atmosphere"
}
```

**Response:**
```json
{
  "stems": [
    {
      "name": "Heavy Guitar Riff",
      "notes": [
        {"pitch": "C2", "time": 0, "duration": 2, "velocity": 110}
      ]
    }
  ]
}
```

### POST /api/remake
Regenerate a specific stem.

**Request Body:**
```json
{
  "genre": "doom-metal",
  "bpm": 80,
  "prompt": "Heavy crushing riff",
  "stemName": "Heavy Guitar Riff"
}
```

### GET /api/health
Health check endpoint.

## Deploying to Production

### Option 1: Deploy to a VPS (DigitalOcean, Linode, etc.)

1. Copy all files to your server
2. Install Node.js on the server
3. Run `npm install`
4. Set up your `.env` file with the API key
5. Use PM2 to keep the server running:
```bash
npm install -g pm2
pm2 start server.js --name dark-midi-generator
pm2 save
pm2 startup
```

### Option 2: Deploy to Heroku

1. Create a Heroku app
2. Set the `ANTHROPIC_API_KEY` environment variable in Heroku settings
3. Deploy:
```bash
git init
heroku git:remote -a your-app-name
git add .
git commit -m "Initial commit"
git push heroku main
```

### Option 3: Deploy to Railway/Render

1. Connect your GitHub repository
2. Set the `ANTHROPIC_API_KEY` environment variable
3. Railway/Render will automatically detect and deploy the Node.js app

## Mobile Access

To access from your phone:

1. **Local Network**: If running locally, use your computer's IP address:
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Access from phone: `http://192.168.x.x:3000`

2. **Deploy Online**: Use one of the deployment options above to get a public URL

## Troubleshooting

**"Failed to fetch" error:**
- Make sure the backend server is running
- Check that your API key is correctly set in the `.env` file
- Verify your Anthropic API key is valid

**No audio playback:**
- Ensure your browser supports Web Audio API (Chrome, Firefox, Safari)
- Check that audio isn't muted in your browser

**MIDI downloads not working:**
- Check browser console for errors
- Try a different browser
- Ensure pop-ups aren't blocked

## Tech Stack

- **Backend**: Node.js + Express
- **AI**: Anthropic Claude API (Sonnet 4)
- **Frontend**: React (via CDN)
- **Audio**: Web Audio API
- **Styling**: Tailwind CSS

## License

MIT

## Support

For issues or questions, please check the troubleshooting section or open an issue on GitHub.

---

Built with 🤘 for dark music creators

const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Generate full song with sections
app.post('/api/generate-song', async (req, res) => {
    try {
        const { genre, bpm, prompt, duration } = req.body;

        if (!prompt || !genre || !bpm) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({ error: 'API key not configured. Please set ANTHROPIC_API_KEY environment variable.' });
        }

        const genreDescriptions = {
            'doom-metal': {
                name: 'Doom Metal',
                instruments: 'Heavy rhythm guitar (drop C/D tuning, C2-E3), Lead guitar (E3-G4), Crushing bass (E1-A2), Kick drum (C1), Snare (D2), Cymbals (F#3-A3)',
                structure: 'Intro (8-16 beats), Verse (16-32 beats), Chorus (16-24 beats), Bridge (8-16 beats), Solo (16-32 beats), Outro (8-16 beats)'
            },
            'industrial': {
                name: 'Industrial',
                instruments: 'Distorted synth bass (E1-A2), Lead synth (E3-C5), Mechanical percussion (C2-G3), Metallic hits (A3-C4), Noise textures (C3-E4)',
                structure: 'Intro (8-16 beats), Build (16 beats), Main (32 beats), Breakdown (16 beats), Climax (24 beats), Outro (8-16 beats)'
            },
            'dungeon-synth': {
                name: 'Dungeon Synth',
                instruments: 'Medieval synth lead (A3-E5), Ambient pad (A2-E3), Sub bass (E1-A1), Bell sounds (E5-A6), Choir pad (C3-G4)',
                structure: 'Intro (16 beats), Theme A (32 beats), Theme B (32 beats), Development (32 beats), Reprise (24 beats), Outro (16 beats)'
            }
        };

        const genreInfo = genreDescriptions[genre];
        
        const systemPrompt = `You are a professional music composition AI specializing in ${genreInfo.name}.

Create a complete song structure with these sections: ${genreInfo.structure}

Available instruments: ${genreInfo.instruments}

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Create separate sections (intro, verse, chorus, etc.)
3. Each section has multiple instrument stems
4. Keep note counts reasonable: 8-32 notes per stem depending on instrument
5. Maintain musical coherence between sections
6. Use proper note ranges for each instrument
7. ALWAYS include a "vocal_melody" stem with melodic notes suitable for singing
8. Add "lyrics" field to sections that need vocals with short, thematic phrases

Return this EXACT JSON structure:
{
  "title": "song title",
  "sections": [
    {
      "name": "verse",
      "start_beat": 0,
      "duration_beats": 32,
      "lyrics": "Optional: short lyric line if this section has vocals",
      "stems": [
        {
          "instrument": "vocal_melody",
          "notes": [
            {"pitch": "G3", "time": 0, "duration": 2, "velocity": 90}
          ]
        },
        {
          "instrument": "rhythm_guitar",
          "notes": [
            {"pitch": "C2", "time": 0, "duration": 2, "velocity": 100}
          ]
        }
      ]
    }
  ]
}

Musical guidelines:
- Tempo: ${bpm} BPM
- Each section should flow into the next
- Maintain consistent key and rhythm patterns
- Vocal melody: Use singable range (C3-C5), create memorable melodic phrases
- Lyrics: Dark, atmospheric, genre-appropriate themes (1-2 short lines per section)
- Use dynamics (velocity variations)
- NO trailing commas
- All times are relative to section start (start at 0 for each section)`;

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
            messages: [{
                role: 'user',
                content: `${systemPrompt}\n\nUser request: ${prompt}\nBPM: ${bpm}\nGenre: ${genreInfo.name}\n\nCreate a cohesive ${genreInfo.name} song with proper structure.`
            }]
        });

        const content = message.content[0].text;
        
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            console.error('No JSON object found in response:', content);
            throw new Error('AI did not return valid JSON. Please try again.');
        }
        
        let songData;
        try {
            let jsonStr = jsonMatch[0];
            // Clean up common JSON issues
            jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            jsonStr = jsonStr.replace(/\n/g, ' ');
            
            songData = JSON.parse(jsonStr);
            
            // Validate structure
            if (!songData.sections || !Array.isArray(songData.sections)) {
                throw new Error('Invalid song structure');
            }
            
            // Validate each section
            for (const section of songData.sections) {
                if (!section.name || !section.stems || !Array.isArray(section.stems)) {
                    throw new Error('Invalid section structure');
                }
                for (const stem of section.stems) {
                    if (!stem.instrument || !Array.isArray(stem.notes)) {
                        throw new Error('Invalid stem structure');
                    }
                }
            }
            
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            console.error('Attempted to parse:', jsonMatch[0].substring(0, 500));
            throw new Error('AI returned malformed JSON. Please try generating again.');
        }
        
        res.json({ song: songData });

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate song' });
    }
});

// Remake specific section with selected instruments
app.post('/api/remake-section', async (req, res) => {
    try {
        const { genre, bpm, prompt, sectionName, instruments, durationBeats } = req.body;

        if (!prompt || !genre || !bpm || !sectionName) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({ error: 'API key not configured.' });
        }

        const genreDescriptions = {
            'doom-metal': 'Doom Metal',
            'industrial': 'Industrial',
            'dungeon-synth': 'Dungeon Synth'
        };

        const genreInfo = genreDescriptions[genre];
        const instrumentList = instruments && instruments.length > 0 
            ? instruments.join(', ') 
            : 'all instruments';

        const systemPrompt = `Regenerate ONLY the "${sectionName}" section for a ${genreInfo} track at ${bpm} BPM.

Original prompt: ${prompt}
Instruments to regenerate: ${instrumentList}
Duration: ${durationBeats || 32} beats

CRITICAL: Return ONLY valid JSON - no markdown, no explanations.

Return this EXACT JSON structure:
{
  "name": "${sectionName}",
  "start_beat": 0,
  "duration_beats": ${durationBeats || 32},
  "lyrics": "Optional: short lyric line if vocals are included",
  "stems": [
    {
      "instrument": "instrument_name",
      "notes": [
        {"pitch": "C3", "time": 0, "duration": 2, "velocity": 100}
      ]
    }
  ]
}

Rules:
- Make it DIFFERENT from the original but still fit the genre
- Keep it ${durationBeats || 32} beats long
- 8-32 notes per stem
- If "vocal_melody" is in the instrument list, include singable melody (C3-C5 range) and add lyrics
- NO trailing commas
- All numbers must be valid integers
- Pitch format: Note + octave (e.g., "C2", "D#3")`;

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{
                role: 'user',
                content: systemPrompt
            }]
        });

        const content = message.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Could not parse AI response');
        }
        
        let section;
        try {
            let jsonStr = jsonMatch[0];
            jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            section = JSON.parse(jsonStr);
            
            if (!section.stems || !Array.isArray(section.stems)) {
                throw new Error('Invalid section structure');
            }
        } catch (e) {
            throw new Error('AI returned malformed JSON. Please try again.');
        }
        
        res.json({ section });

    } catch (error) {
        console.error('Remake section error:', error);
        res.status(500).json({ error: error.message || 'Failed to remake section' });
    }
});

// Legacy endpoint for simple generation (backwards compatibility)
app.post('/api/generate', async (req, res) => {
    try {
        const { genre, bpm, prompt } = req.body;

        if (!prompt || !genre || !bpm) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({ error: 'API key not configured.' });
        }

        const genreDescriptions = {
            'doom-metal': {
                name: 'Doom Metal',
                instructions: 'Heavy guitar riffs in drop tunings (C2-E3), crushing bass (E1-A2), slow powerful drums'
            },
            'industrial': {
                name: 'Industrial',
                instructions: 'Distorted synths, mechanical percussion, harsh bass lines'
            },
            'dungeon-synth': {
                name: 'Dungeon Synth',
                instructions: 'Medieval-style synths, ambient pads, minimal percussion'
            }
        };

        const genreInfo = genreDescriptions[genre];
        
        const systemPrompt = `You are a music composition AI specializing in ${genreInfo.name}.

CRITICAL: Return ONLY valid JSON - no markdown, no explanations, no backticks.

Return a JSON array with 3-5 instrument stems. Each stem should have 8-24 notes maximum.

EXACT structure required:
[
  {
    "name": "instrument name",
    "notes": [
      {"pitch": "C3", "time": 0, "duration": 2, "velocity": 100}
    ]
  }
]

Rules:
- ${genreInfo.instructions}
- Keep compositions SHORT: 16-32 beats total
- 3-5 stems maximum
- 8-24 notes per stem
- NO trailing commas
- Velocity: 60-127 (integers only)
- Pitch: Note + octave (e.g., "C2", "D#3")`;

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{
                role: 'user',
                content: `${systemPrompt}\n\nUser request: ${prompt}\nBPM: ${bpm}\nGenre: ${genreInfo.name}`
            }]
        });

        const content = message.content[0].text;
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        
        if (!jsonMatch) {
            throw new Error('Could not parse AI response');
        }
        
        let stems;
        try {
            let jsonStr = jsonMatch[0];
            jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            stems = JSON.parse(jsonStr);
        } catch (e) {
            throw new Error('AI returned malformed JSON. Please try generating again.');
        }
        
        res.json({ stems });

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate stems' });
    }
});

// Remake stem endpoint
app.post('/api/remake', async (req, res) => {
    try {
        const { genre, bpm, prompt, stemName } = req.body;

        if (!prompt || !genre || !bpm || !stemName) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({ error: 'API key not configured.' });
        }

        const genreDescriptions = {
            'doom-metal': 'Doom Metal',
            'industrial': 'Industrial',
            'dungeon-synth': 'Dungeon Synth'
        };

        const genreInfo = genreDescriptions[genre];

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: `Regenerate ONLY the "${stemName}" stem for a ${genreInfo} track at ${bpm} BPM.

Original prompt: ${prompt}

CRITICAL: Return ONLY valid JSON - no markdown, no explanations, no backticks.

Return a JSON object with this EXACT structure:
{
  "name": "${stemName}",
  "notes": [
    {"pitch": "C3", "time": 0, "duration": 2, "velocity": 100}
  ]
}

Rules:
- Make it different from before but fit the genre
- Keep it 16-32 beats long
- 8-24 notes maximum
- NO trailing commas
- Velocity: 60-127 (integers)
- Pitch format: Note + octave (e.g., "C2", "D#3")`
            }]
        });

        const content = message.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Could not parse AI response');
        }
        
        let stem;
        try {
            let jsonStr = jsonMatch[0];
            jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            stem = JSON.parse(jsonStr);
        } catch (e) {
            throw new Error('AI returned malformed JSON. Please try remaking again.');
        }
        
        res.json({ stem });

    } catch (error) {
        console.error('Remake error:', error);
        res.status(500).json({ error: error.message || 'Failed to remake stem' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
    });
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Dark MIDI Generator API',
        version: '2.0.0',
        endpoints: {
            '/api/generate-song': 'POST - Generate full song with sections',
            '/api/generate': 'POST - Generate simple MIDI stems',
            '/api/remake': 'POST - Remake a specific stem',
            '/api/health': 'GET - Health check'
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎸 Dark MIDI Generator server running on port ${PORT}`);
    console.log(`🔑 API Key configured: ${process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No'}`);
});

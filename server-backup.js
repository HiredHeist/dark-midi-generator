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

// Generate stems endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { genre, bpm, prompt } = req.body;

        if (!prompt || !genre || !bpm) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({ error: 'API key not configured. Please set ANTHROPIC_API_KEY environment variable.' });
        }

        const genreDescriptions = {
            'doom-metal': {
                name: 'Doom Metal',
                instructions: 'Include: heavy guitar riffs in drop tunings (C2-E3), crushing bass (E1-A2), slow powerful drums'
            },
            'industrial': {
                name: 'Industrial',
                instructions: 'Include: distorted synths, mechanical percussion, harsh bass lines'
            },
            'dungeon-synth': {
                name: 'Dungeon Synth',
                instructions: 'Include: medieval-style synths, ambient pads, minimal percussion'
            }
        };

        const genreInfo = genreDescriptions[genre];
        
        const systemPrompt = `You are a music composition AI specializing in ${genreInfo.name}. Generate MIDI stem data for a ${bpm} BPM composition.

CRITICAL: Return ONLY valid JSON - no markdown, no explanations, no backticks.

Return a JSON array of stems with this EXACT structure:
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
- Keep compositions 16-32 beats long
- Use appropriate note ranges for each instrument
- NO trailing commas in JSON
- All numbers must be valid (no decimals for velocity)
- Pitch format: Note + octave (e.g., "C2", "D#3", "F4")`;

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{
                role: 'user',
                content: `${systemPrompt}\n\nUser request: ${prompt}\nBPM: ${bpm}\nGenre: ${genreInfo.name}`
            }]
        });

        const content = message.content[0].text;
        
        // Try to extract JSON array from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        
        if (!jsonMatch) {
            console.error('No JSON array found in response:', content);
            throw new Error('AI did not return valid JSON. Please try again.');
        }
        
        let stems;
        try {
            // Clean up common JSON issues
            let jsonStr = jsonMatch[0];
            // Remove trailing commas before closing brackets/braces
            jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            // Fix common formatting issues
            jsonStr = jsonStr.replace(/\n/g, ' ');
            
            stems = JSON.parse(jsonStr);
            
            // Validate structure
            if (!Array.isArray(stems) || stems.length === 0) {
                throw new Error('Invalid stems array structure');
            }
            
            // Validate each stem has required fields
            for (const stem of stems) {
                if (!stem.name || !Array.isArray(stem.notes)) {
                    throw new Error('Stem missing required fields (name or notes)');
                }
                // Ensure all notes have required fields
                for (const note of stem.notes) {
                    if (!note.pitch || note.time === undefined || note.duration === undefined) {
                        throw new Error('Note missing required fields');
                    }
                }
            }
            
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            console.error('Attempted to parse:', jsonMatch[0].substring(0, 500));
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
            return res.status(500).json({ error: 'API key not configured. Please set ANTHROPIC_API_KEY environment variable.' });
        }

        const genreDescriptions = {
            'doom-metal': 'Doom Metal',
            'industrial': 'Industrial',
            'dungeon-synth': 'Dungeon Synth'
        };

        const genreInfo = genreDescriptions[genre];

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
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
- NO trailing commas in JSON
- All numbers must be valid
- Pitch format: Note + octave (e.g., "C2", "D#3")`
            }]
        });

        const content = message.content[0].text;
        
        // Try to extract JSON object from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            console.error('No JSON object found in response:', content);
            throw new Error('AI did not return valid JSON. Please try again.');
        }
        
        let stem;
        try {
            // Clean up common JSON issues
            let jsonStr = jsonMatch[0];
            // Remove trailing commas before closing brackets/braces
            jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            // Fix common formatting issues
            jsonStr = jsonStr.replace(/\n/g, ' ');
            
            stem = JSON.parse(jsonStr);
            
            // Validate structure
            if (!stem.name || !Array.isArray(stem.notes)) {
                throw new Error('Stem missing required fields');
            }
            
            // Validate notes
            for (const note of stem.notes) {
                if (!note.pitch || note.time === undefined || note.duration === undefined) {
                    throw new Error('Note missing required fields');
                }
            }
            
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            console.error('Attempted to parse:', jsonMatch[0].substring(0, 500));
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
        version: '1.0.0',
        endpoints: {
            '/api/generate': 'POST - Generate MIDI stems',
            '/api/remake': 'POST - Remake a specific stem',
            '/api/health': 'GET - Health check'
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎸 Dark MIDI Generator server running on port ${PORT}`);
    console.log(`🔑 API Key configured: ${process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No'}`);
});

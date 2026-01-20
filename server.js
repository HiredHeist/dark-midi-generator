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
                instruments: 'Fuzzed rhythm guitar (B or C standard tuning, tritones, B1-E3), Thick bass following guitar (B0-E2), Simple pounding drums (C1 kick, D1 snare, F#2 hi-hat), Atmospheric lead (E3-B4), Vocal melody (C3-E4)',
                structure: 'Intro (16 beats), Verse (32 beats), Chorus (24 beats), Bridge (16 beats), Solo (24 beats), Outro (16 beats)',
                notes: 'Doom characteristics: VERY SLOW (40-70 BPM recommended), simple repetitive riffs (6-12 notes), fuzzed/scooped guitar tone, bass doubles guitar for wall of sound, slow pounding drums, tritone intervals, psychedelic atmosphere. Think Electric Wizard, Sleep, Black Sabbath.'
            },
            'industrial': {
                name: 'Industrial',
                instruments: 'Distorted harsh synth bass (E1-A2), Aggressive lead synth (E3-C5), Heavily processed mechanical drums (C1 kick, D1 snare with distortion), Metallic percussion hits (A2-C4), Noise/texture layers (C3-E4), Vocal melody (C3-B4)',
                structure: 'Intro (8 beats), Build (16 beats), Main (32 beats), Breakdown (16 beats), Climax (24 beats), Outro (8 beats)',
                notes: 'Industrial characteristics: 100-140 BPM, granular/glitchy textures, tape-degraded sound, distorted looped drums, harsh Oberheim Xpander-style synths, mechanical repetitive patterns, lo-fi deliberately "broken" production. Think Nine Inch Nails Broken/Downward Spiral era, Skinny Puppy.'
            },
            'dungeon-synth': {
                name: 'Dungeon Synth',
                instruments: 'Medieval synth lead (phrygian/dorian modes, A3-E5), Dark ambient pad (A2-E3), Deep sub bass (E1-A1), Bell/chime sounds (E5-A6), Ethereal choir pad (C3-G4), Vocal melody (C3-E4)',
                structure: 'Intro (16 beats), Theme A (32 beats), Theme B (32 beats), Development (32 beats), Reprise (24 beats), Outro (16 beats)',
                notes: 'Dungeon synth characteristics: 60-90 BPM, medieval scales (phrygian dominant, dorian), atmospheric layered synths, fantasy/LOTR inspired, dark ambient textures, minimal drums or medieval percussion, focus on melody and atmosphere.'
            }
        };

        const genreInfo = genreDescriptions[genre];
        
        const systemPrompt = `You are a professional music composition AI specializing in ${genreInfo.name}.

Create a complete song structure with these sections: ${genreInfo.structure}

Available instruments: ${genreInfo.instruments}

MANDATORY INSTRUMENTS - EVERY SECTION MUST HAVE ALL 5:
1. "drums" - MUST use these exact MIDI notes:
   - Bass/Kick: C1 (main kick drum)
   - Bass/Kick 2: C#1 (alternate kick)
   - Snare: D1 (snare drum)
   - Clap: D#1 (hand clap)
   - Tom 1: E1 (low tom)
   - Tom 2: F1 (mid tom)
   - Tom 3: F#1 (high tom)
   - FX/Noise: G1 (effects/noise)
   - Closed Hat: G#1 (closed hi-hat)
   - Open Hat: A1 (open hi-hat)
   - Crash: A#1 (crash cymbal)
   - Ride: B1 (ride cymbal)
   ONLY use these 12 notes for drums. Typical pattern: C1 (kick), D1 (snare), G#1 (closed hat)
2. "bass" - Low end foundation (E1-A2 range)
3. "rhythm_synth" - Chords and rhythm (C2-E3 range)
4. "lead_synth" - Melodic lead (E3-C5 range)
5. "vocal_melody" - Singing melody (C3-C5 range)

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations, no backticks
2. Create separate sections (intro, verse, chorus, etc.)
3. EVERY section MUST have ALL 5 mandatory instruments
4. Keep note counts SHORT: 8-20 notes per stem maximum
5. Maintain musical coherence between sections
6. Use proper note ranges for each instrument
7. ALWAYS include "lyrics" field with FULL LYRICS (2-4 lines) for sections with vocals

LYRICS THEMES BY GENRE:
- Doom Metal: Psychedelic, marijuana, horror, cosmic dread. Think Electric Wizard, Sleep, Bongzilla.
- Industrial: Self-reflecting, harsh reality, inner darkness, rage, control. Nine Inch Nails style.
- Dungeon Synth: Fantasy, magic, ancient kingdoms, mystical journeys. Lord of the Rings inspired.

Return this EXACT JSON structure:
{
  "title": "song title",
  "sections": [
    {
      "name": "verse",
      "start_beat": 0,
      "duration_beats": 32,
      "lyrics": "Full lyrics here\nMultiple lines\nDark and atmospheric\nGenre-appropriate theme",
      "stems": [
        {
          "instrument": "drums",
          "notes": [
            {"pitch": "C1", "time": 0, "duration": 0.5, "velocity": 110},
            {"pitch": "G#1", "time": 0.5, "duration": 0.5, "velocity": 80},
            {"pitch": "D1", "time": 1, "duration": 0.5, "velocity": 100},
            {"pitch": "G#1", "time": 1.5, "duration": 0.5, "velocity": 80}
          ]
        },
        {
          "instrument": "bass",
          "notes": [
            {"pitch": "E1", "time": 0, "duration": 2, "velocity": 100}
          ]
        },
        {
          "instrument": "rhythm_synth",
          "notes": [
            {"pitch": "C2", "time": 0, "duration": 2, "velocity": 90}
          ]
        },
        {
          "instrument": "lead_synth",
          "notes": [
            {"pitch": "G3", "time": 0, "duration": 2, "velocity": 85}
          ]
        },
        {
          "instrument": "vocal_melody",
          "notes": [
            {"pitch": "E3", "time": 0, "duration": 2, "velocity": 90}
          ]
        }
      ]
    }
  ]
}

Musical guidelines:
- Tempo: ${bpm} BPM
- Genre notes: ${genreInfo.notes || ''}
- Each section flows into the next
- Keep compositions SIMPLE and SHORT
- EXACTLY 5 stems per section (all 5 mandatory instruments)
- Note count per stem: 8-20 notes (adjust based on tempo and genre)
- For DOOM METAL: Use 6-12 notes per riff, very repetitive, slow
- For INDUSTRIAL: 12-20 notes, mechanical/looped patterns
- For DUNGEON SYNTH: 10-18 notes, melodic and atmospheric
- DRUMS: ONLY use C1, C#1, D1, D#1, E1, F1, F#1, G1, G#1, A1, A#1, B1
  Common pattern: C1 (kick), D1 (snare), G#1 (closed hat), A1 (open hat)
- Vocal melody: Use singable range C3-C5
- Lyrics: 2-4 lines per vocal section, genre-appropriate
- NO trailing commas
- All numbers must be integers
- All times relative to section start (start at 0)

REMINDER: EVERY SECTION MUST HAVE: drums, bass, rhythm_synth, lead_synth, vocal_melody`;

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
            messages: [{
                role: 'user',
                content: `${systemPrompt}\n\nUser request: ${prompt}\nBPM: ${bpm}\nGenre: ${genreInfo.name}\n\nCreate a cohesive ${genreInfo.name} song with proper structure.`
            }]
        });

        const content = message.content[0].text;
        
        // Try multiple ways to extract JSON
        let jsonStr = null;
        
        // Method 1: Look for JSON object
        let jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        
        // Method 2: If no match, try removing markdown
        if (!jsonStr) {
            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
        }
        
        if (!jsonStr) {
            console.error('No JSON found in response:', content.substring(0, 500));
            throw new Error('AI did not return valid JSON. Please try again with a simpler prompt.');
        }
        
        let songData;
        try {
            // Clean up common JSON issues
            jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
            jsonStr = jsonStr.replace(/\n/g, ' '); // Remove newlines
            jsonStr = jsonStr.replace(/\r/g, ''); // Remove carriage returns
            jsonStr = jsonStr.replace(/\t/g, ' '); // Replace tabs with spaces
            
            songData = JSON.parse(jsonStr);
            
            // Validate structure
            if (!songData.sections || !Array.isArray(songData.sections)) {
                throw new Error('Invalid song structure - missing sections array');
            }
            
            if (songData.sections.length === 0) {
                throw new Error('Invalid song structure - no sections generated');
            }
            
            // Validate each section
            for (let i = 0; i < songData.sections.length; i++) {
                const section = songData.sections[i];
                if (!section.name) {
                    throw new Error(`Section ${i} missing name`);
                }
                if (!section.stems || !Array.isArray(section.stems)) {
                    throw new Error(`Section ${section.name} missing stems array`);
                }
                if (section.stems.length === 0) {
                    throw new Error(`Section ${section.name} has no stems`);
                }
                for (let j = 0; j < section.stems.length; j++) {
                    const stem = section.stems[j];
                    if (!stem.instrument) {
                        throw new Error(`Stem ${j} in section ${section.name} missing instrument name`);
                    }
                    if (!Array.isArray(stem.notes)) {
                        throw new Error(`Stem ${stem.instrument} in section ${section.name} missing notes array`);
                    }
                }
            }
            
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            console.error('Attempted to parse:', jsonStr.substring(0, 1000));
            throw new Error('AI returned malformed JSON. Try: 1) Simpler prompt 2) Remove vocal melody request 3) Click generate again');
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

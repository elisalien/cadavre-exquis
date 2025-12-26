import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Game state
const waitingPool = [];
const activePlayers = new Map(); // socketId -> player data
const activeTeams = new Map(); // teamId -> team data

// Roles
const ROLES = ['head', 'body', 'legs'];

// Player joins
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  activePlayers.set(socket.id, {
    socketId: socket.id,
    teamId: null,
    role: null
  });

  // Send connection confirmation
  socket.emit('connection_status', { status: 'connected' });

  // Add to waiting pool
  waitingPool.push(socket.id);
  console.log(`Waiting pool: ${waitingPool.length} players`);
  
  // Try to form a team
  tryFormTeam();

  // Handle drawing saves
  socket.on('save_drawing', async (data) => {
    const player = activePlayers.get(socket.id);
    if (!player || !player.teamId) return;

    const team = activeTeams.get(player.teamId);
    if (!team) return;

    // Update drawing data
    team.drawings[player.role] = {
      canvasData: data.canvasData,
      signature: data.signature || null,
      updated: Date.now()
    };

    console.log(`Auto-save for ${player.role} in team ${player.teamId}`);
  });

  // Handle drawing validation
  socket.on('validate_drawing', async (data) => {
    const player = activePlayers.get(socket.id);
    if (!player || !player.teamId) return;

    const team = activeTeams.get(player.teamId);
    if (!team) return;

    // Mark as validated
    team.drawings[player.role].validated = true;
    team.drawings[player.role].signature = data.signature || null;
    team.validatedCount++;

    console.log(`Player validated ${player.role} - Team ${team.validatedCount}/3`);

    // Notify team members of progress
    team.members.forEach(memberId => {
      io.to(memberId).emit('team_progress', {
        validated: team.validatedCount,
        total: 3
      });
    });

    // If all 3 validated, assemble and save
    if (team.validatedCount === 3) {
      await assembleAndSave(team);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Remove from waiting pool
    const poolIndex = waitingPool.indexOf(socket.id);
    if (poolIndex > -1) {
      waitingPool.splice(poolIndex, 1);
    }

    // Handle team disruption
    const player = activePlayers.get(socket.id);
    if (player && player.teamId) {
      const team = activeTeams.get(player.teamId);
      if (team) {
        // Notify other team members
        team.members.forEach(memberId => {
          if (memberId !== socket.id) {
            io.to(memberId).emit('team_disrupted', {
              message: 'Un joueur s\'est déconnecté'
            });
          }
        });
        // Clean up team
        activeTeams.delete(player.teamId);
      }
    }

    activePlayers.delete(socket.id);
  });

  // Heartbeat for connection monitoring
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Try to form a team from waiting pool
function tryFormTeam() {
  while (waitingPool.length >= 3) {
    const teamMembers = waitingPool.splice(0, 3);
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Shuffle roles
    const shuffledRoles = [...ROLES].sort(() => Math.random() - 0.5);
    
    const team = {
      id: teamId,
      members: teamMembers,
      drawings: {
        head: { canvasData: null, signature: null, validated: false },
        body: { canvasData: null, signature: null, validated: false },
        legs: { canvasData: null, signature: null, validated: false }
      },
      validatedCount: 0,
      createdAt: Date.now()
    };

    activeTeams.set(teamId, team);

    // Assign roles and notify players
    teamMembers.forEach((socketId, index) => {
      const player = activePlayers.get(socketId);
      if (player) {
        const role = shuffledRoles[index];
        player.teamId = teamId;
        player.role = role;

        io.to(socketId).emit('team_assigned', {
          teamId,
          role,
          roleLabel: getRoleLabel(role)
        });
      }
    });

    console.log(`Team formed: ${teamId} with ${teamMembers.length} members`);
  }
}

// Get role labels
function getRoleLabel(role) {
  const labels = {
    head: 'LA TÊTE',
    body: 'LE BUSTE',
    legs: 'LES JAMBES'
  };
  return labels[role];
}

// Assemble and save the final drawing
async function assembleAndSave(team) {
  try {
    console.log(`Assembling team ${team.id}`);

    // Prepare signatures
    const signatures = [];
    ['head', 'body', 'legs'].forEach(part => {
      if (team.drawings[part].signature) {
        signatures.push(team.drawings[part].signature);
      }
    });

    // Save to database
    const { data: drawingData, error: drawingError } = await supabase
      .from('drawings')
      .insert({
        team_id: team.id,
        head_data: team.drawings.head.canvasData,
        body_data: team.drawings.body.canvasData,
        legs_data: team.drawings.legs.canvasData,
        head_signature: team.drawings.head.signature,
        body_signature: team.drawings.body.signature,
        legs_signature: team.drawings.legs.signature,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (drawingError) {
      console.error('Error saving drawing:', drawingError);
      return;
    }

    console.log(`Drawing saved: ${drawingData.id}`);

    // Notify team members
    team.members.forEach(memberId => {
      io.to(memberId).emit('drawing_complete', {
        message: '✨ Cadavre exquis créé ! Regarde l\'écran de projection'
      });
    });

    // Broadcast to display screen
    io.emit('new_drawing', {
      id: drawingData.id,
      headData: drawingData.head_data,
      bodyData: drawingData.body_data,
      legsData: drawingData.legs_data,
      signatures: signatures.length > 0 ? signatures.join(' • ') : null,
      createdAt: drawingData.created_at
    });

    // Clean up team
    activeTeams.delete(team.id);

  } catch (error) {
    console.error('Error assembling drawing:', error);
  }
}

// Admin endpoints
app.get('/api/stats', (req, res) => {
  const stats = {
    connectedPlayers: activePlayers.size,
    waitingPlayers: waitingPool.length,
    activeTeams: activeTeams.size,
    timestamp: Date.now()
  };
  res.json(stats);
});

app.get('/api/drawings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('drawings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drawings', async (req, res) => {
  try {
    const { head_data, body_data, legs_data, head_signature, body_signature, legs_signature } = req.body;
    
    const { data, error } = await supabase
      .from('drawings')
      .insert({
        team_id: `test_${Date.now()}`,
        head_data,
        body_data,
        legs_data,
        head_signature,
        body_signature,
        legs_signature,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/drawings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('drawings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Notify display screen
    io.emit('delete_drawing', { id });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reset-session', async (req, res) => {
  try {
    const { error } = await supabase
      .from('drawings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) throw error;

    // Clear active teams
    activeTeams.clear();
    
    // Notify all clients
    io.emit('session_reset');

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test mode - simulate 3 players
app.post('/api/test-solo', (req, res) => {
  const testTeamId = `test_${Date.now()}`;
  const testSockets = ['test1', 'test2', 'test3'];
  
  const team = {
    id: testTeamId,
    members: testSockets,
    drawings: {
      head: { canvasData: null, signature: 'Test Head', validated: false },
      body: { canvasData: null, signature: 'Test Body', validated: false },
      legs: { canvasData: null, signature: 'Test Legs', validated: false }
    },
    validatedCount: 0,
    createdAt: Date.now()
  };

  activeTeams.set(testTeamId, team);
  
  res.json({ 
    success: true, 
    teamId: testTeamId,
    message: 'Test team created. Use the test interface to simulate drawings.'
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

const CONFIG_FILE = path.join(__dirname, 'cost_config.json');
const PROJECTS_FILE = path.join(__dirname, 'projects.json');

const DEFAULT_CONFIG = {
  materials: {
    wood: { Low: 100, Medium: 200, High: 350 },
    steel: { Low: 150, Medium: 300, High: 500 },
    sand: { Low: 50, Medium: 100, High: 180 },
    cement: { Low: 80, Medium: 160, High: 260 },
    bricks: { Low: 60, Medium: 120, High: 200 }
  },
  construction_rate_per_sqft: 1800,
  registration_percent: 7,
  base_employee_salary: 25000,
  base_engineer_salary: 45000
};

// Helper function to read JSON file safely
function readJsonFile(filePath, defaultData) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return defaultData;
  }
}

// Helper function to write JSON file safely
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    return false;
  }
}

// API: Get current cost configuration
app.get('/api/config', (req, res) => {
  const config = readJsonFile(CONFIG_FILE, DEFAULT_CONFIG);
  res.json(config);
});

// API: Update cost configuration
app.post('/api/config', (req, res) => {
  const newConfig = req.body;
  if (!newConfig || !newConfig.materials) {
    return res.status(400).json({ error: 'Invalid configuration data' });
  }
  
  const success = writeJsonFile(CONFIG_FILE, newConfig);
  if (success) {
    res.json({ message: 'Configuration updated successfully', config: newConfig });
  } else {
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// API: Get all projects
app.get('/api/projects', (req, res) => {
  const projects = readJsonFile(PROJECTS_FILE, []);
  res.json(projects);
});

// API: Save project
app.post('/api/projects', (req, res) => {
  const project = req.body;
  if (!project || !project.name) {
    return res.status(400).json({ error: 'Invalid project data. Project name is required.' });
  }

  const projects = readJsonFile(PROJECTS_FILE, []);
  
  // Set ID and timestamp
  project.id = project.id || 'proj_' + Date.now();
  project.createdAt = project.createdAt || new Date().toISOString();

  // If project exists, update it; otherwise push
  const index = projects.findIndex(p => p.id === project.id);
  if (index !== -1) {
    projects[index] = project;
  } else {
    projects.push(project);
  }

  const success = writeJsonFile(PROJECTS_FILE, projects);
  if (success) {
    res.json({ message: 'Project saved successfully', projects, project });
  } else {
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// API: Delete project
app.delete('/api/projects/:id', (req, res) => {
  const projectId = req.params.id;
  let projects = readJsonFile(PROJECTS_FILE, []);
  
  const initialLength = projects.length;
  projects = projects.filter(p => p.id !== projectId);
  
  if (projects.length === initialLength) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const success = writeJsonFile(PROJECTS_FILE, projects);
  if (success) {
    res.json({ message: 'Project deleted successfully', projects });
  } else {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

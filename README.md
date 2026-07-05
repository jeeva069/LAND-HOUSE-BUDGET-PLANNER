# AI-Based Smart House Construction Budget Planning System

A premium, full-stack, interactive budget estimation and visual planning system designed to help you plan, cost-optimize, and visualize house construction in real-time.

## Features

- **Full-Stack API & Dual-Mode Operations**:
  - Automatically attempts to connect to the Node/Express backend (`server.js`) on port `3000` to fetch material costs and save project profiles.
  - **Graceful Standalone Fallback**: If the server is offline or Node.js is not installed, the app functions fully in the browser by saving configurations and profiles to `localStorage`!
- **Interactive 3D House Blueprint Visualizer**:
  - Employs **Three.js** to render a rotatable, zoomable 3D house structure.
  - Dynamically updates structure styling based on:
    - **Home Type**: Displays single-floor structure for Single Room, multi-floor Duplex structure for Double Room.
    - **Construction Time Limit**: 3–5 months renders steel frame skeleton/concrete slab, 6–11 months renders completed walls/doors/roof, 12+ months adds landscaping elements (trees, walkways, fences).
    - **Material Selection Quality**: Colors and reflectivity of walls, roofs, and frames change according to Sand, Wood, and Steel levels.
- **Detailed User Inputs & Form Controls**:
  - Land specifications with conversion toggles (Sq. Ft / Acres).
  - Manual Registration Override (switches from auto-calculated percentage to exact input value).
  - Comprehensive laborer and engineering salaries (switchable between Monthly rates or Flat-rate total contracts).
  - Core materials selectors (Wood, Steel, Sand at Low / Medium / High qualities).
- **Color-Coded Budget Status Bar**:
  - 🟢 **Optimal**: Total spending is within budget.
  - 🟡 **Near Limit**: Total spending exceeds budget by up to 15%.
  - 🔴 **Exceeded**: Total spending exceeds budget by more than 15%.
- **Actionable Budget Optimization Suggestions**:
  - Dynamically isolates the highest cost components.
  - Provides customized advice for downgrading specific finishes (e.g. wood quality High to Medium) or accelerating timelines to reduce labor salaries.
- **Visual Shares Dashboard**:
  - Chart.js donut chart representing land, registration, materials, core construction, and salary percentages.
  - Linear budget gauge comparison bar.
- **Finance shortfall & Loan EMI Planner**:
  - Computes exact recurring monthly savings target needed to cover shortfall.
  - Built-in PMT loan formula calculator to estimate Monthly EMI payments.

---

## Project Structure

- `index.html` - The modern, glassmorphic layout dashboard.
- `app.js` - The interactive scripting engine (Three.js renderer, calculations, and local/server sync).
- `styles.css` - Sleek slate-dark theme design and responsive variables.
- `server.js` - Express backend API server.
- `package.json` - Node dependencies and run scripts.
- `cost_config.json` - Backend administrative rate configuration table (generated on run).
- `projects.json` - Backend database list for saved project profiles (generated on run).

---

## Getting Started

### Option A: Running Standalone (No installation needed)
1. Simply double-click and open `index.html` in any web browser.
2. The system runs fully offline, caching all parameters and projects inside your browser's local storage.

### Option B: Running Full-Stack Server
If you have Node.js installed on your machine:
1. Open a terminal in the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.
5. All administrative cost updates and profile saves will persist to the backend files on disk (`cost_config.json`, `projects.json`).

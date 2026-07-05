// Baseline Default Configuration
const DEFAULT_CONFIG = {
  materials: {
    wood:   { Low: 100, Medium: 200, High: 350 },
    steel:  { Low: 150, Medium: 300, High: 500 },
    sand:   { Low: 50,  Medium: 100, High: 180 },
    cement: { Low: 80,  Medium: 160, High: 260 },
    bricks: { Low: 60,  Medium: 120, High: 200 }
  },
  construction_rate_per_sqft: 1800,
  registration_percent: 7,
  base_employee_salary: 25000,
  base_engineer_salary: 45000
};

// Structural materials — only downgraded as a last resort
const STRUCTURAL_MATERIALS = ['steel', 'cement'];
// Non-structural materials — downgraded first when budget is tight
const NON_STRUCTURAL_MATERIALS = ['wood', 'sand', 'bricks'];
// Quality ladder
const QUALITY_LEVELS = ['High', 'Medium', 'Low'];

// Application State Variables
let costConfig = { ...DEFAULT_CONFIG };
let savedProjects = [];
let chartInstance = null;
let activeUnit = 'sqft';
let elements = {};

// Three.js 3D Scene Global Variables
let scene, camera, renderer, controls, houseGroup;

// DOM Initialization
function initElements() {
  // Sidebar elements
  elements.landUnitToggle = document.getElementById('land-unit-toggle');
  elements.inpLandSize = document.getElementById('inp-land-size');
  elements.lblLandSize = document.getElementById('lbl-land-size');
  elements.hintLandSize = document.getElementById('hint-land-size');
  elements.chkLandTotalPrice = document.getElementById('chk-land-total-price');
  elements.inpLandPriceRate = document.getElementById('inp-land-price-rate');
  elements.addonLandPrice = document.getElementById('addon-land-price');
  elements.inpRegistrationRate = document.getElementById('inp-registration-rate');
  elements.valRegistrationPercent = document.getElementById('val-registration-percent');
  elements.inpRegistrationOverride = document.getElementById('inp-registration-override');
  elements.valRegistrationOverrideStatus = document.getElementById('val-registration-override-status');

  // Construction details
  elements.selHomeType = document.getElementById('sel-home-type');
  elements.inpConstructionArea = document.getElementById('inp-construction-area');
  elements.inpConstructionRate = document.getElementById('inp-construction-rate');
  elements.inpTimeLimit = document.getElementById('inp-time-limit');
  elements.valTimeLimit = document.getElementById('val-time-limit');
  elements.inpEmployeeSalary = document.getElementById('inp-employee-salary');
  elements.selEmployeeSalaryType = document.getElementById('sel-employee-salary-type');
  elements.inpEngineerSalary = document.getElementById('inp-engineer-salary');
  elements.selEngineerSalaryType = document.getElementById('sel-engineer-salary-type');

  // User budget
  elements.inpUserBudget = document.getElementById('inp-user-budget');

  // Material quality selectors
  elements.selWoodLevel  = document.getElementById('sel-wood-level');
  elements.selSteelLevel = document.getElementById('sel-steel-level');
  elements.selSandLevel  = document.getElementById('sel-sand-level');

  // Admin rates configuration
  elements.adminConfigCard = document.getElementById('admin-config-card');
  elements.adminConfigHeader = document.getElementById('admin-config-header');
  elements.adminChevron = document.getElementById('admin-chevron');
  elements.adminContent = document.getElementById('admin-content');
  elements.rateWoodLow    = document.getElementById('rate-wood-low');
  elements.rateWoodMed    = document.getElementById('rate-wood-med');
  elements.rateWoodHigh   = document.getElementById('rate-wood-high');
  elements.rateSteelLow   = document.getElementById('rate-steel-low');
  elements.rateSteelMed   = document.getElementById('rate-steel-med');
  elements.rateSteelHigh  = document.getElementById('rate-steel-high');
  elements.rateSandLow    = document.getElementById('rate-sand-low');
  elements.rateSandMed    = document.getElementById('rate-sand-med');
  elements.rateSandHigh   = document.getElementById('rate-sand-high');
  elements.rateCementLow  = document.getElementById('rate-cement-low');
  elements.rateCementMed  = document.getElementById('rate-cement-med');
  elements.rateCementHigh = document.getElementById('rate-cement-high');
  elements.rateBricksLow  = document.getElementById('rate-bricks-low');
  elements.rateBricksMed  = document.getElementById('rate-bricks-med');
  elements.rateBricksHigh = document.getElementById('rate-bricks-high');
  elements.btnSaveRates = document.getElementById('btn-save-rates');

  // AI Material Suggestion output elements
  elements.materialsSuggestionsGrid = document.getElementById('materials-suggestions-grid');
  elements.matFixedCost        = document.getElementById('mat-fixed-cost');
  elements.matRemainingBudget  = document.getElementById('mat-remaining-budget');
  elements.matTotalCost        = document.getElementById('mat-total-cost');

  // 3D Canvas visualizer elements
  elements.visualizerStatus = document.getElementById('visualizer-status');
  elements.canvasContainer = document.getElementById('blueprint-3d-canvas-container');

  // Status banner elements
  elements.statusBanner = document.getElementById('status-banner');
  elements.statusIcon = document.getElementById('status-icon');
  elements.statusTitle = document.getElementById('status-title');
  elements.statusDesc = document.getElementById('status-desc');
  elements.statusDiffPercent = document.getElementById('status-diff-percent');
  elements.statusDiffAmount = document.getElementById('status-diff-amount');

  // Cost breakdown table & charts
  elements.breakdownTableBody = document.getElementById('breakdown-table-body');
  elements.budgetProgressFill = document.getElementById('budget-progress-fill');
  elements.progressCostLabel = document.getElementById('progress-cost-label');

  // Additional fees checkboxes
  elements.chkInterior = document.getElementById('chk-cost-interior');
  elements.chkBoundary = document.getElementById('chk-cost-boundary');
  elements.chkUtility = document.getElementById('chk-cost-utility');
  elements.chkBorewell = document.getElementById('chk-cost-borewell');
  elements.chkArchitect = document.getElementById('chk-cost-architect');
  elements.chkContingency = document.getElementById('chk-cost-contingency');
  elements.chkCustom = document.getElementById('chk-cost-custom');
  elements.customCostContainer = document.getElementById('custom-cost-input-container');
  elements.inpCustomCostVal = document.getElementById('inp-custom-cost-val');

  // Optimization panel
  elements.suggestionsListBox = document.getElementById('suggestions-list-box');
  elements.optimizationContainer = document.getElementById('optimization-container');
  elements.optAreaCurrent = document.getElementById('opt-area-current');
  elements.optAreaReductionVal = document.getElementById('opt-area-reduction-val');
  elements.inpOptAreaReduction = document.getElementById('inp-opt-area-reduction');
  elements.optAreaSavings = document.getElementById('opt-area-savings');
  elements.optQualityVal = document.getElementById('opt-quality-val');
  elements.inpOptQuality = document.getElementById('inp-opt-quality');
  elements.optQualitySavings = document.getElementById('opt-quality-savings');
  elements.optimizedTotalBanner = document.getElementById('optimized-total-banner');
  elements.optStatusTitle = document.getElementById('opt-status-title');
  elements.optStatusDesc = document.getElementById('opt-status-desc');
  elements.optStatusTotal = document.getElementById('opt-status-total');
  elements.optStatusDiff = document.getElementById('opt-status-diff');

  // Savings / Finance planner
  elements.savingsLoanContainer = document.getElementById('savings-loan-container');
  elements.savingsShortfallVal = document.getElementById('savings-shortfall-val');
  elements.inpSavingsTimeline = document.getElementById('inp-savings-timeline');
  elements.valSavingsMonths = document.getElementById('val-savings-months');
  elements.savingsMonthlyTarget = document.getElementById('savings-monthly-target');
  elements.inpLoanAmount = document.getElementById('inp-loan-amount');
  elements.inpLoanRate = document.getElementById('inp-loan-rate');
  elements.valLoanRate = document.getElementById('val-loan-rate');
  elements.inpLoanTenure = document.getElementById('inp-loan-tenure');
  elements.valLoanTenure = document.getElementById('val-loan-tenure');
  elements.loanEmiVal = document.getElementById('loan-emi-val');

  // Profiles list & buttons
  elements.inpProjectName = document.getElementById('inp-project-name');
  elements.btnSaveProject = document.getElementById('btn-save-project');
  elements.savedProjectsList = document.getElementById('saved-projects-list');
  elements.btnReset = document.getElementById('btn-reset');
  elements.btnPrint = document.getElementById('btn-print');
}

// Initial Loading Logic
document.addEventListener('DOMContentLoaded', async () => {
  initElements();
  lucide.createIcons();

  // Load configuration and projects from API or LocalStorage fallback
  await loadRatesConfig();
  await loadSavedProjects();

  // Setup Three.js visualizer
  init3DScene();

  // Attach event listeners
  setupEventListeners();

  // Restore previous input state if saved
  loadInputState();

  // Run initial calculations
  calculateBudget();
});

// Load Material Cost configuration (API with LocalStorage fallback)
async function loadRatesConfig() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('API server error');
    costConfig = await res.json();
  } catch (err) {
    console.warn('Backend API server not accessible, falling back to LocalStorage rates:', err.message);
    const localConfig = localStorage.getItem('budget_planner_rates');
    if (localConfig) {
      try {
        costConfig = JSON.parse(localConfig);
      } catch (e) {
        costConfig = { ...DEFAULT_CONFIG };
      }
    } else {
      costConfig = { ...DEFAULT_CONFIG };
    }
  }
  populateRatesInConfigPanel();
}

// Write the rates from costConfig object back to Admin Inputs
function populateRatesInConfigPanel() {
  const m = costConfig.materials;
  elements.rateWoodLow.value    = (m.wood   || DEFAULT_CONFIG.materials.wood).Low;
  elements.rateWoodMed.value    = (m.wood   || DEFAULT_CONFIG.materials.wood).Medium;
  elements.rateWoodHigh.value   = (m.wood   || DEFAULT_CONFIG.materials.wood).High;

  elements.rateSteelLow.value   = (m.steel  || DEFAULT_CONFIG.materials.steel).Low;
  elements.rateSteelMed.value   = (m.steel  || DEFAULT_CONFIG.materials.steel).Medium;
  elements.rateSteelHigh.value  = (m.steel  || DEFAULT_CONFIG.materials.steel).High;

  elements.rateSandLow.value    = (m.sand   || DEFAULT_CONFIG.materials.sand).Low;
  elements.rateSandMed.value    = (m.sand   || DEFAULT_CONFIG.materials.sand).Medium;
  elements.rateSandHigh.value   = (m.sand   || DEFAULT_CONFIG.materials.sand).High;

  if (elements.rateCementLow) {
    elements.rateCementLow.value  = (m.cement || DEFAULT_CONFIG.materials.cement).Low;
    elements.rateCementMed.value  = (m.cement || DEFAULT_CONFIG.materials.cement).Medium;
    elements.rateCementHigh.value = (m.cement || DEFAULT_CONFIG.materials.cement).High;
  }
  if (elements.rateBricksLow) {
    elements.rateBricksLow.value  = (m.bricks || DEFAULT_CONFIG.materials.bricks).Low;
    elements.rateBricksMed.value  = (m.bricks || DEFAULT_CONFIG.materials.bricks).Medium;
    elements.rateBricksHigh.value = (m.bricks || DEFAULT_CONFIG.materials.bricks).High;
  }
}

// Save Admin Cost configuration (API with LocalStorage fallback)
async function saveRatesConfig() {
  const newConfig = {
    materials: {
      wood: {
        Low:    parseFloat(elements.rateWoodLow.value)    || 0,
        Medium: parseFloat(elements.rateWoodMed.value)   || 0,
        High:   parseFloat(elements.rateWoodHigh.value)  || 0
      },
      steel: {
        Low:    parseFloat(elements.rateSteelLow.value)   || 0,
        Medium: parseFloat(elements.rateSteelMed.value)  || 0,
        High:   parseFloat(elements.rateSteelHigh.value) || 0
      },
      sand: {
        Low:    parseFloat(elements.rateSandLow.value)    || 0,
        Medium: parseFloat(elements.rateSandMed.value)   || 0,
        High:   parseFloat(elements.rateSandHigh.value)  || 0
      },
      cement: {
        Low:    parseFloat(elements.rateCementLow  ? elements.rateCementLow.value  : DEFAULT_CONFIG.materials.cement.Low)    || 0,
        Medium: parseFloat(elements.rateCementMed  ? elements.rateCementMed.value  : DEFAULT_CONFIG.materials.cement.Medium) || 0,
        High:   parseFloat(elements.rateCementHigh ? elements.rateCementHigh.value : DEFAULT_CONFIG.materials.cement.High)   || 0
      },
      bricks: {
        Low:    parseFloat(elements.rateBricksLow  ? elements.rateBricksLow.value  : DEFAULT_CONFIG.materials.bricks.Low)    || 0,
        Medium: parseFloat(elements.rateBricksMed  ? elements.rateBricksMed.value  : DEFAULT_CONFIG.materials.bricks.Medium) || 0,
        High:   parseFloat(elements.rateBricksHigh ? elements.rateBricksHigh.value : DEFAULT_CONFIG.materials.bricks.High)   || 0
      }
    },
    construction_rate_per_sqft: costConfig.construction_rate_per_sqft,
    registration_percent: costConfig.registration_percent,
    base_employee_salary: costConfig.base_employee_salary,
    base_engineer_salary: costConfig.base_engineer_salary
  };

  costConfig = newConfig;
  localStorage.setItem('budget_planner_rates', JSON.stringify(costConfig));

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
    if (res.ok) {
      alert('Rates saved successfully to the server database!');
    } else {
      throw new Error('API save error');
    }
  } catch (err) {
    console.warn('Failed to update config on backend. Offline local save complete.', err);
    alert('Offline local save complete! (No active backend found)');
  }

  calculateBudget();
}

// Load Saved Projects (API with LocalStorage fallback)
async function loadSavedProjects() {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('API server error');
    savedProjects = await res.json();
  } catch (err) {
    console.warn('Backend API server not accessible, falling back to LocalStorage projects:', err.message);
    const localProjects = localStorage.getItem('budget_planner_projects');
    savedProjects = localProjects ? JSON.parse(localProjects) : [];
  }
  renderProjectsList();
}

// Save Project Profile (API with LocalStorage fallback)
async function saveProjectProfile() {
  const name = elements.inpProjectName.value.trim();
  if (!name) {
    alert('Please enter a profile name first.');
    return;
  }

  const projectData = {
    name,
    landSize: parseFloat(elements.inpLandSize.value) || 0,
    landUnit: activeUnit,
    landPriceRate: parseFloat(elements.inpLandPriceRate.value) || 0,
    isTotalLandPrice: elements.chkLandTotalPrice.checked,
    registrationRate: parseFloat(elements.inpRegistrationRate.value) || 0,
    registrationOverride: parseFloat(elements.inpRegistrationOverride.value) || '',
    homeType: elements.selHomeType.value,
    constructionArea: parseFloat(elements.inpConstructionArea.value) || 0,
    constructionRate: parseFloat(elements.inpConstructionRate.value) || 0,
    timeLimit: parseInt(elements.inpTimeLimit.value) || 0,
    employeeSalary: parseFloat(elements.inpEmployeeSalary.value) || 0,
    employeeSalaryType: elements.selEmployeeSalaryType.value,
    engineerSalary: parseFloat(elements.inpEngineerSalary.value) || 0,
    engineerSalaryType: elements.selEngineerSalaryType.value,
    woodLevel: elements.selWoodLevel.value,
    steelLevel: elements.selSteelLevel.value,
    sandLevel: elements.selSandLevel.value,
    userBudget: parseFloat(elements.inpUserBudget.value) || 0,
    additionalCharges: {
      interior: elements.chkInterior.checked,
      boundary: elements.chkBoundary.checked,
      utility: elements.chkUtility.checked,
      borewell: elements.chkBorewell.checked,
      architect: elements.chkArchitect.checked,
      contingency: elements.chkContingency.checked,
      custom: elements.chkCustom.checked,
      customVal: parseFloat(elements.inpCustomCostVal.value) || 0
    }
  };

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (res.ok) {
      const data = await res.json();
      savedProjects = data.projects;
    } else {
      throw new Error('API save error');
    }
  } catch (err) {
    console.warn('Off-line backup: project profile saved in localStorage.', err);
    projectData.id = 'proj_' + Date.now();
    projectData.createdAt = new Date().toISOString();
    savedProjects.push(projectData);
    localStorage.setItem('budget_planner_projects', JSON.stringify(savedProjects));
  }

  elements.inpProjectName.value = '';
  renderProjectsList();
  alert(`Profile "${name}" saved successfully!`);
}

// Delete Project Profile (API with LocalStorage fallback)
async function deleteProjectProfile(id) {
  if (!confirm('Are you sure you want to delete this profile?')) return;

  try {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const data = await res.json();
      savedProjects = data.projects;
    } else {
      throw new Error('API delete error');
    }
  } catch (err) {
    console.warn('Failed to delete on backend. Performing LocalStorage delete.', err);
    savedProjects = savedProjects.filter(p => p.id !== id);
    localStorage.setItem('budget_planner_projects', JSON.stringify(savedProjects));
  }
  renderProjectsList();
}

// Load dynamic project profile from list
function loadProjectProfile(id) {
  const project = savedProjects.find(p => p.id === id);
  if (!project) return;

  // Restore land specs
  elements.inpLandSize.value = project.landSize;
  activeUnit = project.landUnit || 'sqft';
  updateUnitToggleDisplay();

  elements.chkLandTotalPrice.checked = project.isTotalLandPrice;
  elements.inpLandPriceRate.value = project.landPriceRate;
  elements.inpRegistrationRate.value = project.registrationRate;
  elements.inpRegistrationOverride.value = project.registrationOverride || '';

  // Restore home specs
  elements.selHomeType.value = project.homeType || 'double';
  elements.inpConstructionArea.value = project.constructionArea;
  elements.inpConstructionRate.value = project.constructionRate;
  elements.inpTimeLimit.value = project.timeLimit || 8;
  elements.valTimeLimit.textContent = `${elements.inpTimeLimit.value} Months`;
  elements.inpEmployeeSalary.value = project.employeeSalary;
  elements.selEmployeeSalaryType.value = project.employeeSalaryType || 'monthly';
  elements.inpEngineerSalary.value = project.engineerSalary;
  elements.selEngineerSalaryType.value = project.engineerSalaryType || 'monthly';

  // Restore materials
  elements.selWoodLevel.value = project.woodLevel || 'Medium';
  elements.selSteelLevel.value = project.steelLevel || 'Medium';
  elements.selSandLevel.value = project.sandLevel || 'Medium';

  // Restore budget
  elements.inpUserBudget.value = project.userBudget;

  // Restore auxiliary checklist
  const addit = project.additionalCharges || {};
  elements.chkInterior.checked = addit.interior !== false;
  elements.chkBoundary.checked = addit.boundary !== false;
  elements.chkUtility.checked = addit.utility !== false;
  elements.chkBorewell.checked = addit.borewell !== false;
  elements.chkArchitect.checked = addit.architect !== false;
  elements.chkContingency.checked = addit.contingency !== false;
  
  elements.chkCustom.checked = addit.custom || false;
  elements.customCostContainer.classList.toggle('active', elements.chkCustom.checked);
  elements.inpCustomCostVal.value = addit.customVal || 50000;

  calculateBudget();
  alert(`Loaded profile "${project.name}"`);
}

// Render the profiles items inside the container
function renderProjectsList() {
  if (savedProjects.length === 0) {
    elements.savedProjectsList.innerHTML = `<span class="label-hint">No saved profiles found.</span>`;
    return;
  }

  let html = '';
  savedProjects.forEach(proj => {
    const dateStr = new Date(proj.createdAt).toLocaleDateString();
    html += `
      <div class="project-item">
        <div class="project-info-cols">
          <span class="project-name-label">${escapeHtml(proj.name)}</span>
          <span class="project-meta-label">${proj.homeType === 'single' ? 'Single Room' : 'Double Room'} &bull; ${dateStr}</span>
        </div>
        <div class="project-actions-row">
          <button class="btn btn-secondary btn-sm" onclick="loadProjectProfile('${proj.id}')" title="Load profile">
            <i data-lucide="folder-open" style="width: 13px; height: 13px;"></i>
          </button>
          <button class="btn btn-secondary btn-sm" style="color: var(--color-error);" onclick="deleteProjectProfile('${proj.id}')" title="Delete profile">
            <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
          </button>
        </div>
      </div>
    `;
  });
  elements.savedProjectsList.innerHTML = html;
  lucide.createIcons({ attrs: { class: 'lucide' } });
}

// Helper to escape HTML tags
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Interactive Events Registration
function setupEventListeners() {
  const calcInputs = [
    elements.inpLandSize,
    elements.inpLandPriceRate,
    elements.inpRegistrationRate,
    elements.inpRegistrationOverride,
    elements.selHomeType,
    elements.inpConstructionArea,
    elements.inpConstructionRate,
    elements.inpTimeLimit,
    elements.inpEmployeeSalary,
    elements.selEmployeeSalaryType,
    elements.inpEngineerSalary,
    elements.selEngineerSalaryType,
    elements.selWoodLevel,
    elements.selSteelLevel,
    elements.selSandLevel,
    elements.inpUserBudget,
    elements.inpCustomCostVal
  ];

  calcInputs.forEach(input => {
    input.addEventListener('input', () => {
      calculateBudget();
      saveInputState();
    });
    input.addEventListener('change', () => {
      calculateBudget();
      saveInputState();
    });
  });

  // Additional Checkboxes triggers
  const checkboxes = [
    elements.chkLandTotalPrice,
    elements.chkInterior,
    elements.chkBoundary,
    elements.chkUtility,
    elements.chkBorewell,
    elements.chkArchitect,
    elements.chkContingency,
    elements.chkCustom
  ];

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      if (checkbox === elements.chkCustom) {
        elements.customCostContainer.classList.toggle('active', checkbox.checked);
      }
      if (checkbox === elements.chkLandTotalPrice) {
        if (checkbox.checked) {
          elements.lblLandSize.textContent = "Land Size (For Reference)";
          elements.addonLandPrice.textContent = "Total Cost";
        } else {
          elements.lblLandSize.textContent = "Land Size";
          elements.addonLandPrice.textContent = activeUnit === 'sqft' ? '/ Sq.Ft' : '/ Acre';
        }
      }
      calculateBudget();
      saveInputState();
    });
  });

  // Land Unit Toggles
  const unitOptions = elements.landUnitToggle.querySelectorAll('.toggle-option');
  unitOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      unitOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const newUnit = opt.getAttribute('data-unit');
      handleUnitChange(newUnit);
      saveInputState();
    });
  });

  // Construction Duration slider update
  elements.inpTimeLimit.addEventListener('input', (e) => {
    elements.valTimeLimit.textContent = `${e.target.value} Months`;
  });

  // Optimization Simulator inputs
  elements.inpOptAreaReduction.addEventListener('input', (e) => {
    elements.optAreaReductionVal.textContent = `${e.target.value}%`;
    calculateBudget();
  });

  elements.inpOptQuality.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    const label = val === 0 ? 'Standard (-15%)' : val === 1 ? 'Semi-Premium (-8%)' : 'Premium (0%)';
    elements.optQualityVal.textContent = label;
    calculateBudget();
  });

  // Savings / Finance targets inputs
  elements.inpSavingsTimeline.addEventListener('input', (e) => {
    elements.valSavingsMonths.textContent = `${e.target.value} Months`;
    calculateBudget();
  });

  elements.inpLoanRate.addEventListener('input', (e) => {
    elements.valLoanRate.textContent = `${e.target.value}%`;
    calculateBudget();
  });

  elements.inpLoanTenure.addEventListener('input', (e) => {
    elements.valLoanTenure.textContent = `${e.target.value} Years`;
    calculateBudget();
  });

  elements.inpLoanAmount.addEventListener('input', () => {
    calculateBudget();
  });

  // Collapsible Admin Rates Toggle
  elements.adminConfigHeader.addEventListener('click', toggleAdminPanel);

  // Buttons actions
  elements.btnSaveRates.addEventListener('click', saveRatesConfig);
  elements.btnSaveProject.addEventListener('click', saveProjectProfile);
  elements.btnReset.addEventListener('click', resetToDefaults);
  elements.btnPrint.addEventListener('click', () => window.print());
}

// Expand / Collapse Admin Config Panel
function toggleAdminPanel() {
  const isHidden = elements.adminContent.style.display === 'none';
  if (isHidden) {
    elements.adminContent.style.display = 'block';
    elements.adminChevron.style.transform = 'rotate(180deg)';
  } else {
    elements.adminContent.style.display = 'none';
    elements.adminChevron.style.transform = 'rotate(0deg)';
  }
}

// Convert Units and update rates labels
function handleUnitChange(newUnit) {
  if (activeUnit === newUnit) return;
  const currentVal = parseFloat(elements.inpLandSize.value) || 0;
  let newVal = currentVal;

  if (newUnit === 'acres') {
    newVal = currentVal / 43560;
    elements.inpLandSize.value = parseFloat(newVal.toFixed(4));
    elements.hintLandSize.textContent = `1 Acre = 43,560 sqft`;
    if (!elements.chkLandTotalPrice.checked) {
      elements.addonLandPrice.textContent = '/ Acre';
    }
  } else {
    newVal = currentVal * 43560;
    elements.inpLandSize.value = Math.round(newVal);
    elements.hintLandSize.textContent = '';
    if (!elements.chkLandTotalPrice.checked) {
      elements.addonLandPrice.textContent = '/ Sq.Ft';
    }
  }
  activeUnit = newUnit;
  calculateBudget();
}

function updateUnitToggleDisplay() {
  const unitOptions = elements.landUnitToggle.querySelectorAll('.toggle-option');
  unitOptions.forEach(opt => {
    if (opt.getAttribute('data-unit') === activeUnit) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  if (activeUnit === 'acres') {
    elements.hintLandSize.textContent = `1 Acre = 43,560 sqft`;
  } else {
    elements.hintLandSize.textContent = '';
  }

  if (elements.chkLandTotalPrice.checked) {
    elements.addonLandPrice.textContent = 'Total Cost';
  } else {
    elements.addonLandPrice.textContent = activeUnit === 'sqft' ? '/ Sq.Ft' : '/ Acre';
  }
}

// Core Mathematical Estimator Logic
function calculateBudget() {
  // 1. Inputs reading
  const landSize = parseFloat(elements.inpLandSize.value) || 0;
  const landPriceRate = parseFloat(elements.inpLandPriceRate.value) || 0;
  const registrationRate = parseFloat(elements.inpRegistrationRate.value) || 0;
  const manualRegCost = parseFloat(elements.inpRegistrationOverride.value);

  const homeType = elements.selHomeType.value;
  const homeTypeFactor = homeType === 'single' ? 1.0 : 1.8;

  const constructionArea = parseFloat(elements.inpConstructionArea.value) || 0;
  const constructionRate = parseFloat(elements.inpConstructionRate.value) || 0;
  const duration = parseInt(elements.inpTimeLimit.value) || 8;

  const employeeSalary = parseFloat(elements.inpEmployeeSalary.value) || 0;
  const employeeSalaryType = elements.selEmployeeSalaryType.value;
  const engineerSalary = parseFloat(elements.inpEngineerSalary.value) || 0;
  const engineerSalaryType = elements.selEngineerSalaryType.value;

  const userBudget = parseFloat(elements.inpUserBudget.value) || 0;

  // 3. Estimate component prices
  // Land cost
  let landCost = 0;
  if (elements.chkLandTotalPrice.checked) {
    landCost = landPriceRate;
  } else {
    const sizeInSqFt = activeUnit === 'acres' ? landSize * 43560 : landSize;
    landCost = sizeInSqFt * landPriceRate;
  }

  // Registration cost
  let registrationCost = 0;
  if (!isNaN(manualRegCost) && manualRegCost >= 0) {
    registrationCost = manualRegCost;
    elements.valRegistrationOverrideStatus.textContent = 'Manual Override';
    elements.valRegistrationOverrideStatus.style.color = 'var(--color-warn)';
  } else {
    registrationCost = landCost * (registrationRate / 100);
    elements.valRegistrationOverrideStatus.textContent = 'Auto-calc';
    elements.valRegistrationOverrideStatus.style.color = 'var(--color-ok)';
  }
  elements.valRegistrationPercent.textContent = `${registrationRate}%`;

  // Construction cost based on rate, area and home complexity
  const constructionCost = constructionArea * constructionRate * homeTypeFactor;

  // Labor (Employee) cost
  const laborCost = employeeSalary * (employeeSalaryType === 'monthly' ? duration : 1);

  // Engineering cost
  const engineeringCost = engineerSalary * (engineerSalaryType === 'monthly' ? duration : 1);

  // FIXED costs (no materials yet)
  const fixedCost = landCost + registrationCost + constructionCost + laborCost + engineeringCost;

  // Read user preferred starting quality levels
  const userWoodLevel  = elements.selWoodLevel  ? elements.selWoodLevel.value  : 'Medium';
  const userSteelLevel = elements.selSteelLevel ? elements.selSteelLevel.value : 'Medium';
  const userSandLevel  = elements.selSandLevel  ? elements.selSandLevel.value  : 'Medium';

  // AI Material Suggestion — greedy downgrade based on remaining budget after fixed costs
  const remainingForMaterials = userBudget - fixedCost;
  const { suggestions: materialSuggestions, totalMaterialCost } = suggestMaterials(
    constructionArea, homeTypeFactor, remainingForMaterials,
    userWoodLevel, userSteelLevel, userSandLevel
  );

  // Update opt-area-current display
  if (elements.optAreaCurrent) {
    elements.optAreaCurrent.textContent = constructionArea.toLocaleString('en-IN');
  }

  // Update the AI Suggestions UI card
  renderMaterialSuggestions(materialSuggestions, fixedCost, remainingForMaterials);

  // Grand totals
  const totalConstructionExpenses = totalMaterialCost + constructionCost + laborCost + engineeringCost;

  // Auxiliary checkbox charges
  const interiorCost = elements.chkInterior.checked ? (constructionCost * 0.15) : 0;
  const boundaryCost = elements.chkBoundary.checked ? 80000 : 0;
  const utilityCost = elements.chkUtility.checked ? 35000 : 0;
  const borewellCost = elements.chkBorewell.checked ? 45000 : 0;
  const architectCost = elements.chkArchitect.checked ? (constructionCost * 0.06) : 0;
  const customCost = elements.chkCustom.checked ? (parseFloat(elements.inpCustomCostVal.value) || 0) : 0;

  const additionalChargesSubtotal = interiorCost + boundaryCost + utilityCost + borewellCost + architectCost + customCost;

  // Base spending amount before contingency
  const baseCost = landCost + registrationCost + totalConstructionExpenses + additionalChargesSubtotal;
  const contingencyCost = elements.chkContingency.checked ? (baseCost * 0.05) : 0;

  const totalAdditionalCharges = additionalChargesSubtotal + contingencyCost;

  // Total project cost
  const totalProjectCost = landCost + registrationCost + totalConstructionExpenses + totalAdditionalCharges;

  // 4. Compare with available budget
  const diffAmount = totalProjectCost - userBudget;
  const diffPercent = userBudget > 0 ? (diffAmount / userBudget) * 100 : 0;

  // Define color-coded budget status
  let status = 'ok';
  let statusTitle = '🟢 Budget Optimal';
  let statusText = 'Excellent! Your project estimates are within your designated budget.';

  if (diffAmount > 0) {
    if (diffPercent <= 15) {
      status = 'warn';
      statusTitle = '🟡 Near Budget Limit';
      statusText = `Estimate is slightly over budget by ${diffPercent.toFixed(1)}%. Review optimization suggestions.`;
    } else {
      status = 'error';
      statusTitle = '🔴 Budget Exceeded';
      statusText = `Critical! Estimates are ${diffPercent.toFixed(1)}% above budget. Immediate cost optimization is recommended.`;
    }
  }

  // Draw updated banner in HTML
  elements.statusBanner.className = `status-banner status-${status}`;
  elements.statusTitle.textContent = statusTitle;
  elements.statusDesc.textContent = statusText;

  const absDiff = Math.abs(diffAmount);
  elements.statusDiffPercent.textContent = `${diffAmount > 0 ? '+' : ''}${diffPercent.toFixed(1)}%`;
  elements.statusDiffAmount.textContent = diffAmount > 0
    ? `Shortfall: ${formatCurrency(absDiff)}`
    : `Surplus: ${formatCurrency(absDiff)}`;

  let iconName = 'check-circle-2';
  if (status === 'warn') iconName = 'alert-triangle';
  if (status === 'error') iconName = 'alert-octagon';
  elements.statusIcon.setAttribute('data-lucide', iconName);
  lucide.createIcons();

  // 5. Update Cost breakdown table rows
  renderBreakdownTable(
    landCost, registrationCost,
    materialSuggestions,
    constructionCost, laborCost, engineeringCost,
    totalAdditionalCharges, totalProjectCost
  );

  // 6. Update Donut Chart
  updateDonutChart(landCost, registrationCost, totalMaterialCost, constructionCost, laborCost + engineeringCost, totalAdditionalCharges);

  // 7. Progress Bar filling
  updateProgressGauge(totalProjectCost, userBudget, status);

  // 8. Generate dynamic budget suggestions
  const aiWoodLevel   = materialSuggestions.find(s => s.key === 'wood')?.level   || 'Medium';
  const aiSteelLevel  = materialSuggestions.find(s => s.key === 'steel')?.level  || 'Medium';
  const aiSandLevel   = materialSuggestions.find(s => s.key === 'sand')?.level   || 'Medium';

  generateOptimizationSuggestions(
    diffAmount,
    constructionArea,
    homeTypeFactor,
    aiWoodLevel,
    aiSteelLevel,
    aiSandLevel,
    duration,
    employeeSalary,
    employeeSalaryType,
    engineerSalary,
    engineerSalaryType,
    landCost,
    registrationCost,
    totalMaterialCost,
    constructionCost,
    laborCost,
    engineeringCost,
    totalAdditionalCharges
  );

  // 9. Drive 3D visualizer from AI-chosen material levels
  update3DHouse(homeType, duration, aiWoodLevel, aiSteelLevel, aiSandLevel);

  // 9. Savings shortfall & loan calculator
  if (diffAmount > 0) {
    elements.savingsLoanContainer.style.display = 'block';
    elements.savingsShortfallVal.textContent = formatCurrency(diffAmount);

    const savingsMonths = parseInt(elements.inpSavingsTimeline.value) || 24;
    const monthlyTarget = diffAmount / savingsMonths;
    elements.savingsMonthlyTarget.textContent = `${formatCurrency(monthlyTarget)} / mo`;

    // Auto-fill Loan shortfall
    const currentLoanInput = parseFloat(elements.inpLoanAmount.value);
    if (isNaN(currentLoanInput) || currentLoanInput <= 0) {
      elements.inpLoanAmount.value = Math.round(diffAmount);
    }
  } else {
    elements.savingsLoanContainer.style.display = 'none';
  }

  // Recalculate EMI
  calculateEMI();

  // 10. Run interactive optimization simulator slider adjustments
  runOptimizationSimulator(totalProjectCost, constructionCost, userBudget);
}

// -----------------------------------------------------------------------
// AI MATERIAL SUGGESTION ENGINE
// -----------------------------------------------------------------------

/**
 * suggestMaterials — Greedy budget-aware algorithm.
 *
 * Strategy:
 *  1. Start every material at the user's chosen quality level (defaults High if not set).
 *  2. Compute total material cost at current levels.
 *  3. If total > remainingBudget, downgrade non-structural materials first
 *     (wood -> sand -> bricks), each from High->Medium->Low.
 *  4. If still over budget, downgrade structural materials
 *     (steel -> cement), each from High->Medium->Low.
 *  5. Return the final suggested levels + individual costs.
 *
 * @param {number} area          - Build area in sq.ft
 * @param {number} factor        - Home type multiplier (1.0 or 1.8)
 * @param {number} remaining     - Budget remaining after fixed costs
 * @param {string} userWood      - User preferred wood level
 * @param {string} userSteel     - User preferred steel level
 * @param {string} userSand      - User preferred sand level
 * @returns {{ suggestions: Array, totalMaterialCost: number }}
 */
function suggestMaterials(area, factor, remaining, userWood = 'High', userSteel = 'High', userSand = 'High') {
  const mat = costConfig.materials;

  // All 5 materials, ordered by downgrade priority:
  // non-structural first, structural last
  const allMaterials = [
    { key: 'wood',   label: 'Wood',   structural: false },
    { key: 'sand',   label: 'Sand',   structural: false },
    { key: 'bricks', label: 'Bricks', structural: false },
    { key: 'steel',  label: 'Steel',  structural: true  },
    { key: 'cement', label: 'Cement', structural: true  }
  ];

  // Start from user-preferred levels (or High as default)
  const levels = {
    wood:   userWood  || 'High',
    sand:   userSand  || 'High',
    bricks: 'High',
    steel:  userSteel || 'High',
    cement: 'High'
  };

  // Helper: compute total material cost given current levels map
  function totalCostAt(lvls) {
    return allMaterials.reduce((sum, m) => {
      const rates = mat[m.key] || DEFAULT_CONFIG.materials[m.key];
      return sum + (rates[lvls[m.key]] || 0) * area * factor;
    }, 0);
  }

  // Greedy downgrade loop — only downgrades if over budget
  const downgradeOrder = ['wood', 'sand', 'bricks', 'steel', 'cement'];
  for (const key of downgradeOrder) {
    // Try Medium (only if currently at High)
    if (levels[key] === 'High' && totalCostAt(levels) > remaining) {
      levels[key] = 'Medium';
    }
    // Try Low (only if currently at Medium)
    if (levels[key] === 'Medium' && totalCostAt(levels) > remaining) {
      levels[key] = 'Low';
    }
  }

  // Build result array
  const suggestions = allMaterials.map(m => {
    const rates = mat[m.key] || DEFAULT_CONFIG.materials[m.key];
    const level = levels[m.key];
    const unitRate = rates[level] || 0;
    const cost = unitRate * area * factor;
    return { key: m.key, label: m.label, structural: m.structural, level, unitRate, cost };
  });

  const totalMaterialCost = suggestions.reduce((s, m) => s + m.cost, 0);
  return { suggestions, totalMaterialCost };
}

/**
 * renderMaterialSuggestions — Paints the AI Material Suggestions card.
 */
function renderMaterialSuggestions(suggestions, fixedCost, remainingBudget) {
  if (!elements.materialsSuggestionsGrid) return;

  // Update summary numbers
  if (elements.matFixedCost) {
    elements.matFixedCost.textContent = formatCurrency(fixedCost);
  }
  if (elements.matRemainingBudget) {
    const isPositive = remainingBudget >= 0;
    elements.matRemainingBudget.textContent = formatCurrency(Math.abs(remainingBudget));
    elements.matRemainingBudget.style.color = isPositive ? 'var(--color-ok)' : 'var(--color-error)';
    // Prefix with minus if negative
    if (!isPositive) {
      elements.matRemainingBudget.textContent = '-' + elements.matRemainingBudget.textContent;
    }
  }

  // Render suggestion tiles
  const badgeClass = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };
  const levelIcon  = { High: 'star', Medium: 'minus-circle', Low: 'arrow-down-circle' };

  let html = '';
  suggestions.forEach(s => {
    const badge = badgeClass[s.level] || 'badge-medium';
    const icon  = levelIcon[s.level]  || 'minus-circle';
    const structTag = s.structural
      ? `<span class="structural-tag">Structural</span>`
      : `<span class="non-structural-tag">Finishing</span>`;
    html += `
      <div class="material-tile">
        <div class="material-tile-header">
          <div class="material-name-row">
            <span class="material-label">${s.label}</span>
            ${structTag}
          </div>
          <span class="quality-badge ${badge}">
            <i data-lucide="${icon}" style="width:11px;height:11px;"></i>
            ${s.level}
          </span>
        </div>
        <div class="material-tile-body">
          <div class="material-rate-row">
            <span class="label-hint">Unit Rate</span>
            <span class="material-rate-val">&#8377;${s.unitRate}/sq.ft</span>
          </div>
          <div class="material-rate-row">
            <span class="label-hint">Estimated Cost</span>
            <span class="material-cost-val">${formatCurrency(s.cost)}</span>
          </div>
        </div>
      </div>
    `;
  });

  elements.materialsSuggestionsGrid.innerHTML = html;

  // Total cost
  const total = suggestions.reduce((s, m) => s + m.cost, 0);
  if (elements.matTotalCost) {
    elements.matTotalCost.textContent = formatCurrency(total);
  }

  lucide.createIcons();
}

// -----------------------------------------------------------------------
// Update the Breakdown Table rows (materialSuggestions = array from suggestMaterials)
// -----------------------------------------------------------------------
function renderBreakdownTable(land, reg, materialSuggestions, constr, labor, eng, additional, total) {
  const totalMaterialCost = materialSuggestions.reduce((s, m) => s + m.cost, 0);

  // Fixed component rows
  const fixedComponents = [
    { name: 'Land Purchase Cost',            amount: land,             color: '#3b82f6' },
    { name: 'Registration & Legal Fees',     amount: reg,              color: '#60a5fa' },
    { name: 'Base Construction',             amount: constr,           color: '#6366f1' },
    { name: 'Labor Salaries',                amount: labor,            color: '#f59e0b' },
    { name: 'Engineering Fees',              amount: eng,              color: '#ec4899' },
    { name: 'Aux. Costs & Contingency',      amount: additional,       color: '#a855f7' }
  ];

  // Material colour palette
  const matColors = {
    wood: '#84cc16', steel: '#94a3b8', sand: '#eab308',
    cement: '#78716c', bricks: '#f97316'
  };

  let html = '';

  fixedComponents.forEach(comp => {
    const percent = total > 0 ? (comp.amount / total) * 100 : 0;
    html += `
      <tr>
        <td><span class="cost-dot" style="background-color:${comp.color};"></span>${comp.name}</td>
        <td style="text-align:right;font-weight:500;">${formatCurrency(comp.amount)}</td>
        <td style="text-align:right;color:var(--text-secondary);">${percent.toFixed(1)}%</td>
      </tr>`;
  });

  // Material sub-header
  html += `
    <tr style="background:rgba(16,185,129,0.06);">
      <td colspan="3" style="padding:0.4rem 0.75rem;font-size:0.78rem;color:#6ee7b7;font-weight:600;letter-spacing:0.04em;"
        >&#9658; MATERIALS (AI Suggested)</td>
    </tr>`;

  materialSuggestions.forEach(m => {
    const percent = total > 0 ? (m.cost / total) * 100 : 0;
    const color   = matColors[m.key] || '#10b981';
    const badge   = m.level === 'High' ? '#10b981' : m.level === 'Medium' ? '#f59e0b' : '#ef4444';
    html += `
      <tr>
        <td>
          <span class="cost-dot" style="background-color:${color};"></span>
          ${m.label}
          <span style="margin-left:0.4rem;padding:1px 6px;border-radius:999px;font-size:0.68rem;
            background:${badge}22;color:${badge};border:1px solid ${badge}44;">${m.level}</span>
        </td>
        <td style="text-align:right;font-weight:500;">${formatCurrency(m.cost)}</td>
        <td style="text-align:right;color:var(--text-secondary);">${percent.toFixed(1)}%</td>
      </tr>`;
  });

  html += `
    <tr class="total-row">
      <td>Total Spending Amount</td>
      <td style="text-align:right;">${formatCurrency(total)}</td>
      <td style="text-align:right;">100.0%</td>
    </tr>`;

  elements.breakdownTableBody.innerHTML = html;
}

// Donut chart renderer using Chart.js
function updateDonutChart(land, reg, material, constr, salaries, additional) {
  const ctx = document.getElementById('cost-donut-chart').getContext('2d');
  const data = {
    labels: ['Land', 'Reg & Legal', 'Materials', 'Construction', 'Salaries', 'Aux & Contingency'],
    datasets: [{
      data: [land, reg, material, constr, salaries, additional],
      backgroundColor: ['#3b82f6', '#60a5fa', '#10b981', '#6366f1', '#f59e0b', '#a855f7'],
      borderWidth: 1,
      borderColor: '#0f172a',
      hoverOffset: 4
    }]
  };

  if (chartInstance) {
    chartInstance.data = data;
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) label += ': ';
                if (context.parsed !== null) label += formatCurrency(context.parsed);
                return label;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }
}

// Progress gauge mapping
function updateProgressGauge(cost, budget, status) {
  const percent = budget > 0 ? (cost / budget) * 100 : 0;
  const fillPercent = Math.min(percent, 100);
  elements.budgetProgressFill.style.width = `${fillPercent}%`;

  if (status === 'ok') {
    elements.budgetProgressFill.style.backgroundColor = 'var(--color-ok)';
  } else if (status === 'warn') {
    elements.budgetProgressFill.style.backgroundColor = 'var(--color-warn)';
  } else {
    elements.budgetProgressFill.style.backgroundColor = 'var(--color-error)';
  }
  elements.progressCostLabel.textContent = `${percent.toFixed(0)}%`;
}

// Generate actionable tips to bring user under budget
function generateOptimizationSuggestions(
  diffAmount,
  constructionArea,
  homeTypeFactor,
  woodLevel,
  steelLevel,
  sandLevel,
  duration,
  employeeSalary,
  employeeSalaryType,
  engineerSalary,
  engineerSalaryType,
  landCost,
  registrationCost,
  materialCost,
  constructionCost,
  laborCost,
  engineeringCost,
  additionalCharges
) {
  // If under budget, clear panel
  if (diffAmount <= 0) {
    elements.optimizationContainer.style.display = 'none';
    elements.suggestionsListBox.innerHTML = '';
    return;
  }

  elements.optimizationContainer.style.display = 'block';
  const suggestions = [];

  // 1. Identify and highlight primary cost component
  const componentsList = [
    { label: 'Land Purchase', amount: landCost },
    { label: 'Registration Fees', amount: registrationCost },
    { label: 'Materials Costs', amount: materialCost },
    { label: 'Core Construction Cost', amount: constructionCost },
    { label: 'Labor Salary', amount: laborCost },
    { label: 'Engineering Salaries', amount: engineeringCost },
    { label: 'Auxiliary Extras', amount: additionalCharges }
  ];
  componentsList.sort((a, b) => b.amount - a.amount);
  const highest = componentsList[0];
  suggestions.push({
    text: `**Cost Driver Alert**: The largest component is **${highest.label}** at **${formatCurrency(highest.amount)}**. Focusing cost cuts here yields maximum impact.`,
    impact: 'info'
  });

  // 2. Material downgrade simulations
  // Wood
  if (woodLevel === 'High') {
    const savings = (costConfig.materials.wood.High - costConfig.materials.wood.Medium) * constructionArea * homeTypeFactor;
    if (savings > 0) {
      suggestions.push({
        text: `Downgrade Wood finishes from **High to Medium** to save **${formatCurrency(savings)}**.`,
        impact: 'save'
      });
    }
  } else if (woodLevel === 'Medium') {
    const savings = (costConfig.materials.wood.Medium - costConfig.materials.wood.Low) * constructionArea * homeTypeFactor;
    if (savings > 0) {
      suggestions.push({
        text: `Downgrade Wood finishes from **Medium to Low** to save **${formatCurrency(savings)}**.`,
        impact: 'save'
      });
    }
  }

  // Steel
  if (steelLevel === 'High') {
    const savings = (costConfig.materials.steel.High - costConfig.materials.steel.Medium) * constructionArea * homeTypeFactor;
    if (savings > 0) {
      suggestions.push({
        text: `Downgrade Steel grade from **High to Medium** to save **${formatCurrency(savings)}**.`,
        impact: 'save'
      });
    }
  } else if (steelLevel === 'Medium') {
    const savings = (costConfig.materials.steel.Medium - costConfig.materials.steel.Low) * constructionArea * homeTypeFactor;
    if (savings > 0) {
      suggestions.push({
        text: `Downgrade Steel grade from **Medium to Low** to save **${formatCurrency(savings)}**.`,
        impact: 'save'
      });
    }
  }

  // Sand
  if (sandLevel === 'High') {
    const savings = (costConfig.materials.sand.High - costConfig.materials.sand.Medium) * constructionArea * homeTypeFactor;
    if (savings > 0) {
      suggestions.push({
        text: `Downgrade Sand grade from **High to Medium** to save **${formatCurrency(savings)}**.`,
        impact: 'save'
      });
    }
  } else if (sandLevel === 'Medium') {
    const savings = (costConfig.materials.sand.Medium - costConfig.materials.sand.Low) * constructionArea * homeTypeFactor;
    if (savings > 0) {
      suggestions.push({
        text: `Downgrade Sand grade from **Medium to Low** to save **${formatCurrency(savings)}**.`,
        impact: 'save'
      });
    }
  }

  // 3. Construction Timeline salary optimizations
  let monthlyExpenses = 0;
  if (employeeSalaryType === 'monthly') monthlyExpenses += employeeSalary;
  if (engineerSalaryType === 'monthly') monthlyExpenses += engineerSalary;

  if (monthlyExpenses > 0 && duration > 3) {
    const timelineSavings = monthlyExpenses * 2; // saving 2 months
    suggestions.push({
      text: `Accelerate construction timeline by **2 months** to save **${formatCurrency(timelineSavings)}** in monthly laborer and engineer salaries.`,
      impact: 'save'
    });
  }

  // 4. Area reduction suggestion
  const tenPercentAreaSavings = (constructionCost / constructionArea) * (constructionArea * 0.1);
  suggestions.push({
    text: `Reducing the built area footprint by **10%** would save approx. **${formatCurrency(tenPercentAreaSavings)}** in basic construction costs.`,
    impact: 'save'
  });

  // Render suggestions list
  let html = '';
  suggestions.forEach(sug => {
    let borderStyle = 'border: 1px solid rgba(245, 158, 11, 0.15); background: rgba(245, 158, 11, 0.04); color: var(--color-warn);';
    let icon = 'info';
    if (sug.impact === 'save') {
      borderStyle = 'border: 1px solid rgba(16, 185, 129, 0.15); background: rgba(16, 185, 129, 0.04); color: var(--color-ok);';
      icon = 'sparkles';
    }
    
    // Quick inline conversion of markdown bold to html bold
    const formattedText = sug.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    html += `
      <div style="padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; display: flex; align-items: flex-start; gap: 0.5rem; ${borderStyle}">
        <i data-lucide="${icon}" style="width: 14px; height: 14px; flex-shrink: 0; margin-top: 0.1rem;"></i>
        <span>${formattedText}</span>
      </div>
    `;
  });
  elements.suggestionsListBox.innerHTML = html;
  lucide.createIcons();
}

// EMI Planner
function calculateEMI() {
  const loanAmount = parseFloat(elements.inpLoanAmount.value) || 0;
  const annualRate = parseFloat(elements.inpLoanRate.value) || 7.5;
  const tenureYears = parseInt(elements.inpLoanTenure.value) || 15;

  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  let emi = 0;
  if (loanAmount > 0) {
    if (monthlyRate === 0) {
      emi = loanAmount / totalMonths;
    } else {
      emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
            (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
  }
  elements.loanEmiVal.textContent = `${formatCurrency(emi)} / mo`;
}

// Interactive What-If Optimization Simulator sliders
function runOptimizationSimulator(totalProjectCost, constructionCost, userBudget) {
  const areaReduction = parseFloat(elements.inpOptAreaReduction.value) || 0;
  const areaSavings = (areaReduction / 100) * constructionCost;
  elements.optAreaSavings.textContent = areaReduction > 0 ? `Saving: -${formatCurrency(areaSavings)}` : 'Saving: ₹0';

  const optQuality = parseInt(elements.inpOptQuality.value);
  let qualityDiscount = 0;
  if (optQuality === 0) qualityDiscount = 0.15; // standard
  if (optQuality === 1) qualityDiscount = 0.08; // semi-premium

  const remainingConstructionCost = constructionCost - areaSavings;
  const qualitySavings = remainingConstructionCost * qualityDiscount;
  elements.optQualitySavings.textContent = optQuality < 2 ? `Saving: -${formatCurrency(qualitySavings)}` : 'Saving: ₹0';

  const totalSimulatedSavings = areaSavings + qualitySavings;
  const optimizedTotal = totalProjectCost - totalSimulatedSavings;

  if (totalSimulatedSavings > 0) {
    elements.optimizedTotalBanner.style.display = 'flex';
    elements.optStatusTotal.textContent = formatCurrency(optimizedTotal);

    const optDiff = optimizedTotal - userBudget;
    const optDiffPercent = userBudget > 0 ? (optDiff / userBudget) * 100 : 0;

    if (optDiff <= 0) {
      elements.optimizedTotalBanner.className = 'status-banner status-ok';
      elements.optStatusTitle.textContent = "Optimized Status: OK 🟢";
      elements.optStatusDesc.textContent = "Modifications bring the project within your budget limit!";
      elements.optStatusDiff.textContent = `Surplus: ${formatCurrency(Math.abs(optDiff))} (-${Math.abs(optDiffPercent).toFixed(1)}%)`;
    } else {
      elements.optimizedTotalBanner.className = 'status-banner status-warn';
      elements.optStatusTitle.textContent = "Optimized Status: Near Limit 🟡";
      elements.optStatusDesc.textContent = "Modifications help reduce the gap, but you are still slightly over.";
      elements.optStatusDiff.textContent = `Shortfall: ${formatCurrency(optDiff)} (+${optDiffPercent.toFixed(1)}%)`;
    }
  } else {
    elements.optimizedTotalBanner.style.display = 'none';
  }
}

// -------------------------------------------------------------
// Interactive 3D blueprint Renderer using Three.js
// -------------------------------------------------------------
function init3DScene() {
  const container = elements.canvasContainer;
  if (!container) return;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1d);

  // Camera
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(10, 8, 10);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.08; // Prevent camera from going underground
  controls.minDistance = 4;
  controls.maxDistance = 20;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
  dirLight.position.set(12, 18, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  // Parent Group for House
  houseGroup = new THREE.Group();
  scene.add(houseGroup);

  // Start Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  elements.visualizerStatus.textContent = "3D Engine Ready";
}

// Redraw house model inside houseGroup based on user configurations
function update3DHouse(homeType, duration, woodLevel, steelLevel, sandLevel) {
  if (!houseGroup) return;

  // Clear previous meshes
  while (houseGroup.children.length > 0) {
    const obj = houseGroup.children[0];
    houseGroup.remove(obj);
  }

  // 1. Establish visual specs mapping from levels
  // Wood Material specs
  let woodColor = 0x8b5a2b; // Medium Brown
  let woodRough = 0.6;
  if (woodLevel === 'Low') {
    woodColor = 0xc19a6b; // Light Plywood
    woodRough = 0.95;
  } else if (woodLevel === 'High') {
    woodColor = 0x3d2314; // Rich Mahogany
    woodRough = 0.25;
  }
  const woodMaterial = new THREE.MeshStandardMaterial({ color: woodColor, roughness: woodRough });

  // Steel Material specs
  let steelColor = 0x4a5568; // Medium Dark Steel
  let steelMetal = 0.6;
  let steelRough = 0.4;
  if (steelLevel === 'Low') {
    steelColor = 0xa0aec0; // Rough Iron
    steelMetal = 0.15;
    steelRough = 0.8;
  } else if (steelLevel === 'High') {
    steelColor = 0x1a202c; // Polished Carbon Dark
    steelMetal = 0.98;
    steelRough = 0.08;
  }
  const steelMaterial = new THREE.MeshStandardMaterial({ color: steelColor, metalness: steelMetal, roughness: steelRough });

  // Sand / Concrete specs
  let concreteColor = 0xcbd5e1; // Medium Concrete
  let concreteRough = 0.7;
  if (sandLevel === 'Low') {
    concreteColor = 0xe2e8f0; // Sandy / Rough Stucco
    concreteRough = 0.95;
  } else if (sandLevel === 'High') {
    concreteColor = 0x64748b; // Dark Plastered / Smooth
    concreteRough = 0.35;
  }
  const concreteMaterial = new THREE.MeshStandardMaterial({ color: concreteColor, roughness: concreteRough });

  // 2. Add Ground Base (Grass)
  const grassGeo = new THREE.BoxGeometry(9, 0.1, 9);
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 });
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.position.y = -0.05;
  grass.receiveShadow = true;
  houseGroup.add(grass);

  // Path Walkway
  const pathGeo = new THREE.BoxGeometry(1.2, 0.02, 4);
  const pathMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.position.set(0, 0.01, 2.5);
  houseGroup.add(path);

  // Define completion status based on timeline limit
  // <= 5m: Skeleton structural pillars
  // 6-11m: Enclosed walls and standard roof
  // 12m+: Luxury house with fence, balcony structures, and garden trees
  const isSkeleton = duration <= 5;
  const isLuxury = duration >= 12;

  if (homeType === 'single') {
    // ---------------------------------------------------------
    // SINGLE ROOM HOUSE MODEL
    // ---------------------------------------------------------
    if (isSkeleton) {
      elements.visualizerStatus.textContent = "3D View: Single Room Construction (Skeleton Stage)";
      
      // Slab base
      const slabGeo = new THREE.BoxGeometry(4.2, 0.15, 4.2);
      const slab = new THREE.Mesh(slabGeo, concreteMaterial);
      slab.position.y = 0.075;
      houseGroup.add(slab);

      // Steel pillars/columns
      const pillarGeo = new THREE.BoxGeometry(0.25, 2.4, 0.25);
      const coords = [
        [-2, 1.2, -2], [2, 1.2, -2], [-2, 1.2, 2], [2, 1.2, 2]
      ];
      coords.forEach(coord => {
        const pillar = new THREE.Mesh(pillarGeo, steelMaterial);
        pillar.position.set(coord[0], coord[1], coord[2]);
        houseGroup.add(pillar);
      });

      // Ceiling framing steel beams
      const beamGeoX = new THREE.BoxGeometry(4.2, 0.15, 0.25);
      const beamGeoZ = new THREE.BoxGeometry(0.25, 0.15, 4.2);

      const beamF = new THREE.Mesh(beamGeoX, steelMaterial);
      beamF.position.set(0, 2.4, 2);
      const beamB = new THREE.Mesh(beamGeoX, steelMaterial);
      beamB.position.set(0, 2.4, -2);
      const beamL = new THREE.Mesh(beamGeoZ, steelMaterial);
      beamL.position.set(-2, 2.4, 0);
      const beamR = new THREE.Mesh(beamGeoZ, steelMaterial);
      beamR.position.set(2, 2.4, 0);

      houseGroup.add(beamF, beamB, beamL, beamR);

    } else {
      elements.visualizerStatus.textContent = `3D View: Single Room (${isLuxury ? 'Luxury Completed' : 'Completed'})`;

      // House main concrete block
      const houseGeo = new THREE.BoxGeometry(4, 2.2, 4);
      const house = new THREE.Mesh(houseGeo, concreteMaterial);
      house.position.y = 1.1;
      house.castShadow = true;
      houseGroup.add(house);

      // Roof (Pitched triangular cone)
      const roofGeo = new THREE.ConeGeometry(3.2, 1.2, 4);
      const roof = new THREE.Mesh(roofGeo, woodMaterial);
      roof.position.set(0, 2.8, 0);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      houseGroup.add(roof);

      // Main Entrance Door
      const doorGeo = new THREE.BoxGeometry(0.8, 1.6, 0.05);
      const door = new THREE.Mesh(doorGeo, woodMaterial);
      door.position.set(0, 0.8, 2.01);
      houseGroup.add(door);

      // Window Glass
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.75 });
      const windowGeo = new THREE.BoxGeometry(0.9, 0.9, 0.05);
      const winL = new THREE.Mesh(windowGeo, glassMat);
      winL.position.set(-2.01, 1.2, 0);
      winL.rotation.y = Math.PI / 2;
      const winR = new THREE.Mesh(windowGeo, glassMat);
      winR.position.set(2.01, 1.2, 0);
      winR.rotation.y = Math.PI / 2;

      houseGroup.add(winL, winR);
    }
  } else {
    // ---------------------------------------------------------
    // DOUBLE ROOM (DUPLEX) MODEL
    // ---------------------------------------------------------
    if (isSkeleton) {
      elements.visualizerStatus.textContent = "3D View: Double Room Construction (Skeleton Stage)";

      // Concrete slabs (Ground and First floor levels)
      const slabG = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.15, 4.4), concreteMaterial);
      slabG.position.y = 0.075;
      const slabF = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.15, 4.4), concreteMaterial);
      slabF.position.y = 2.275;
      houseGroup.add(slabG, slabF);

      // structural support columns
      const pillarGeo = new THREE.BoxGeometry(0.2, 4.4, 0.2);
      const coords = [
        [-2.1, 2.2, -2.1], [2.1, 2.2, -2.1], [-2.1, 2.2, 2.1], [2.1, 2.2, 2.1],
        [0, 2.2, -2.1], [0, 2.2, 2.1]
      ];
      coords.forEach(coord => {
        const pillar = new THREE.Mesh(pillarGeo, steelMaterial);
        pillar.position.set(coord[0], coord[1], coord[2]);
        houseGroup.add(pillar);
      });

    } else {
      elements.visualizerStatus.textContent = `3D View: Double Room Duplex (${isLuxury ? 'Luxury Completed' : 'Completed'})`;

      // Ground Floor concrete block
      const gfGeo = new THREE.BoxGeometry(4.2, 2.2, 4.2);
      const gf = new THREE.Mesh(gfGeo, concreteMaterial);
      gf.position.y = 1.1;
      gf.castShadow = true;
      houseGroup.add(gf);

      // First Floor block (Offset to create a small balcony!)
      const ffGeo = new THREE.BoxGeometry(4.2, 2.0, 3.2);
      const ff = new THREE.Mesh(ffGeo, concreteMaterial);
      ff.position.set(0, 3.2, -0.5); // pushed back to leave front balcony
      ff.castShadow = true;
      houseGroup.add(ff);

      // Balcony Fence Railings (Steel / Wood)
      const fenceRailGeo = new THREE.BoxGeometry(4.2, 0.7, 0.05);
      const fence = new THREE.Mesh(fenceRailGeo, steelMaterial);
      fence.position.set(0, 2.55, 1.95);
      houseGroup.add(fence);

      // Balcony Side Fences
      const sideFenceGeo = new THREE.BoxGeometry(0.05, 0.7, 0.9);
      const fenceL = new THREE.Mesh(sideFenceGeo, steelMaterial);
      fenceL.position.set(-2.05, 2.55, 1.5);
      const fenceR = new THREE.Mesh(sideFenceGeo, steelMaterial);
      fenceR.position.set(2.05, 2.55, 1.5);
      houseGroup.add(fenceL, fenceR);

      // Main Pitched Roof
      const roofGeo = new THREE.BoxGeometry(4.6, 0.3, 3.6);
      const roof = new THREE.Mesh(roofGeo, woodMaterial);
      roof.position.set(0, 4.35, -0.5);
      roof.rotation.x = 0.08;
      roof.castShadow = true;
      houseGroup.add(roof);

      // Doors
      const doorG = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.05), woodMaterial);
      doorG.position.set(-0.8, 0.8, 2.11);
      const doorF = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.5, 0.05), woodMaterial);
      doorF.position.set(-0.8, 2.95, 1.11); // Balcony exit door
      houseGroup.add(doorG, doorF);

      // Windows
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.75 });
      
      const winG = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.05), glassMat);
      winG.position.set(0.9, 1.2, 2.11);

      const winF = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.05), glassMat);
      winF.position.set(0.9, 3.0, 1.11);

      const sideWin1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.8), glassMat);
      sideWin1.position.set(2.11, 1.2, 0);
      const sideWin2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.8), glassMat);
      sideWin2.position.set(-2.11, 3.0, -0.5);

      houseGroup.add(winG, winF, sideWin1, sideWin2);
    }
  }

  // -----------------------------------------------------------
  // LUXURY AMENITIES (If timeline >= 12 months)
  // -----------------------------------------------------------
  if (isLuxury && !isSkeleton) {
    // Add side perimeter wooden fences
    const postGeo = new THREE.BoxGeometry(0.12, 0.8, 0.12);
    const postMat = woodMaterial;
    
    // Left boundary posts
    for (let z = -4; z <= 4; z += 2) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(-4.2, 0.4, z);
      houseGroup.add(post);
    }
    // Right boundary posts
    for (let z = -4; z <= 4; z += 2) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(4.2, 0.4, z);
      houseGroup.add(post);
    }

    // Horizontal rails
    const railGeo = new THREE.BoxGeometry(0.05, 0.1, 8.4);
    const railL = new THREE.Mesh(railGeo, postMat);
    railL.position.set(-4.2, 0.5, 0);
    const railR = new THREE.Mesh(railGeo, postMat);
    railR.position.set(4.2, 0.5, 0);
    houseGroup.add(railL, railR);

    // Decorative Tree
    const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, 1.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(2.8, 0.75, -2.8);

    const leavesGeo = new THREE.SphereGeometry(0.7, 8, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.set(2.8, 1.7, -2.8);

    houseGroup.add(trunk, leaves);
  }
}

// Reset everything to default specifications
function resetToDefaults() {
  if (confirm("Are you sure you want to reset all inputs to defaults?")) {
    localStorage.removeItem('budget_planner_input_state');
    
    // Reset inputs values
    elements.inpLandSize.value = 1200;
    activeUnit = 'sqft';
    updateUnitToggleDisplay();
    
    elements.chkLandTotalPrice.checked = false;
    elements.lblLandSize.textContent = "Land Size";
    elements.addonLandPrice.textContent = "/ Sq.Ft";
    elements.inpLandPriceRate.value = 3000;
    elements.inpRegistrationRate.value = 7;
    elements.inpRegistrationOverride.value = '';

    elements.selHomeType.value = 'double';
    elements.inpConstructionArea.value = 1000;
    elements.inpConstructionRate.value = 1800;
    elements.inpTimeLimit.value = 8;
    elements.valTimeLimit.textContent = '8 Months';

    elements.inpEmployeeSalary.value = 25000;
    elements.selEmployeeSalaryType.value = 'monthly';
    elements.inpEngineerSalary.value = 45000;
    elements.selEngineerSalaryType.value = 'monthly';

    elements.selWoodLevel.value = 'Medium';
    elements.selSteelLevel.value = 'Medium';
    elements.selSandLevel.value = 'Medium';

    elements.inpUserBudget.value = 5000000;

    elements.chkInterior.checked = true;
    elements.chkBoundary.checked = true;
    elements.chkUtility.checked = true;
    elements.chkBorewell.checked = true;
    elements.chkArchitect.checked = true;
    elements.chkContingency.checked = true;
    elements.chkCustom.checked = false;
    elements.customCostContainer.classList.remove('active');
    elements.inpCustomCostVal.value = 50000;

    // Reset simulator
    elements.inpOptAreaReduction.value = 0;
    elements.optAreaReductionVal.textContent = '0%';
    elements.inpOptQuality.value = 2;
    elements.optQualityVal.textContent = 'Premium (0%)';

    // Reset savings
    elements.inpSavingsTimeline.value = 24;
    elements.valSavingsMonths.textContent = '24 Months';
    elements.inpLoanAmount.value = '';
    elements.inpLoanRate.value = 7.5;
    elements.valLoanRate.textContent = '7.5%';
    elements.inpLoanTenure.value = 15;
    elements.valLoanTenure.textContent = '15 Years';

    calculateBudget();
  }
}

// Cache input values locally
function saveInputState() {
  const state = {
    landSize: parseFloat(elements.inpLandSize.value) || 0,
    landUnit: activeUnit,
    isTotalLandPrice: elements.chkLandTotalPrice.checked,
    landPriceRate: parseFloat(elements.inpLandPriceRate.value) || 0,
    registrationRate: parseFloat(elements.inpRegistrationRate.value) || 0,
    registrationOverride: parseFloat(elements.inpRegistrationOverride.value) || '',
    homeType: elements.selHomeType.value,
    constructionArea: parseFloat(elements.inpConstructionArea.value) || 0,
    constructionRate: parseFloat(elements.inpConstructionRate.value) || 0,
    timeLimit: parseInt(elements.inpTimeLimit.value) || 8,
    employeeSalary: parseFloat(elements.inpEmployeeSalary.value) || 0,
    employeeSalaryType: elements.selEmployeeSalaryType.value,
    engineerSalary: parseFloat(elements.inpEngineerSalary.value) || 0,
    engineerSalaryType: elements.selEngineerSalaryType.value,
    woodLevel: elements.selWoodLevel.value,
    steelLevel: elements.selSteelLevel.value,
    sandLevel: elements.selSandLevel.value,
    userBudget: parseFloat(elements.inpUserBudget.value) || 0,
    additionalCharges: {
      interior: elements.chkInterior.checked,
      boundary: elements.chkBoundary.checked,
      utility: elements.chkUtility.checked,
      borewell: elements.chkBorewell.checked,
      architect: elements.chkArchitect.checked,
      contingency: elements.chkContingency.checked,
      custom: elements.chkCustom.checked,
      customVal: parseFloat(elements.inpCustomCostVal.value) || 0
    },
    savingsTimeline: parseInt(elements.inpSavingsTimeline.value) || 24,
    loanAmount: parseFloat(elements.inpLoanAmount.value) || 0,
    loanRate: parseFloat(elements.inpLoanRate.value) || 7.5,
    loanTenure: parseInt(elements.inpLoanTenure.value) || 15
  };
  localStorage.setItem('budget_planner_input_state', JSON.stringify(state));
}

// Restore input values from cache
function loadInputState() {
  const data = localStorage.getItem('budget_planner_input_state');
  if (!data) return;

  try {
    const state = JSON.parse(data);

    elements.inpLandSize.value = state.landSize;
    activeUnit = state.landUnit || 'sqft';
    updateUnitToggleDisplay();

    elements.chkLandTotalPrice.checked = state.isTotalLandPrice;
    elements.inpLandPriceRate.value = state.landPriceRate;
    elements.inpRegistrationRate.value = state.registrationRate;
    elements.inpRegistrationOverride.value = state.registrationOverride || '';

    elements.selHomeType.value = state.homeType || 'double';
    elements.inpConstructionArea.value = state.constructionArea;
    elements.inpConstructionRate.value = state.constructionRate;
    elements.inpTimeLimit.value = state.timeLimit || 8;
    elements.valTimeLimit.textContent = `${elements.inpTimeLimit.value} Months`;
    elements.inpEmployeeSalary.value = state.employeeSalary;
    elements.selEmployeeSalaryType.value = state.employeeSalaryType || 'monthly';
    elements.inpEngineerSalary.value = state.engineerSalary;
    elements.selEngineerSalaryType.value = state.engineerSalaryType || 'monthly';

    elements.selWoodLevel.value = state.woodLevel || 'Medium';
    elements.selSteelLevel.value = state.steelLevel || 'Medium';
    elements.selSandLevel.value = state.sandLevel || 'Medium';

    elements.inpUserBudget.value = state.userBudget;

    const addit = state.additionalCharges || {};
    elements.chkInterior.checked = addit.interior !== false;
    elements.chkBoundary.checked = addit.boundary !== false;
    elements.chkUtility.checked = addit.utility !== false;
    elements.chkBorewell.checked = addit.borewell !== false;
    elements.chkArchitect.checked = addit.architect !== false;
    elements.chkContingency.checked = addit.contingency !== false;
    
    elements.chkCustom.checked = addit.custom || false;
    elements.customCostContainer.classList.toggle('active', elements.chkCustom.checked);
    elements.inpCustomCostVal.value = addit.customVal || 50000;

    elements.inpSavingsTimeline.value = state.savingsTimeline || 24;
    elements.valSavingsMonths.textContent = `${elements.inpSavingsTimeline.value} Months`;

    elements.inpLoanAmount.value = state.loanAmount || '';
    elements.inpLoanRate.value = state.loanRate || 7.5;
    elements.valLoanRate.textContent = `${elements.inpLoanRate.value}%`;
    elements.inpLoanTenure.value = state.loanTenure || 15;
    elements.valLoanTenure.textContent = `${elements.inpLoanTenure.value} Years`;

  } catch (err) {
    console.error("Error restoring local state:", err);
  }
}

// Formatting helpers
function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

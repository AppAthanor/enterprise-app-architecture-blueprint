// scripts/extract-blueprint-data.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

/**
 * Extract Blueprint Data
 * 
 * This script extracts metadata from all capability MDX files
 * and generates a consolidated JSON file for the blueprint visualization.
 */

// Ensure required directories exist
const staticDir = path.join(__dirname, '../static');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Find all capability MDX files, including nested sub-capabilities
const capabilityFiles = glob.sync(path.join(__dirname, '../docs/capabilities/**/*.mdx'));

// Log the found files for debugging
console.log(`Found ${capabilityFiles.length} capability files`);

// Debug: Print out the files found
capabilityFiles.forEach(file => {
  console.log(`  - ${file}`);
});

// First pass - extract basic metadata without positioning
const capabilityData = capabilityFiles.map((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const { data } = matter(content);
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    type: data.type,
    domain: data.domain,
    owner: data.owner,
    status: data.status,
    phase: data.phase,
    criticality: data.criticality,
    dependencies: data.dependencies,
  };
});

// Second pass - add positioning based on complete metadata
const capabilities = capabilityData.map((capability, index) => {
  // Determine if this is a pillar or functionality
  const isPillar = capability.type === 'pillar';
  
  // Position pillars and functionalities differently
  let x, y;
  
  if (isPillar) {
    // Place pillars in a grid layout with more spacing
    const row = Math.floor(index / 3);
    const col = index % 3;
    x = 300 + (col * 500);  // Increased horizontal spacing
    y = 100 + (row * 350);  // Increased vertical spacing
  } else {
    // Position functionalities relative to their parent pillar
    if (capability.dependencies) {
      // Find parent pillar relationship
      const parentPillarRel = capability.dependencies.find(dep => dep.type === 'parent-pillar');
      if (!parentPillarRel) {
        // Fallback positioning if no parent pillar found
        const row = Math.floor(index / 3);
        const col = index % 3;
        x = 300 + (col * 500);  // Match pillar spacing
        y = 650 + (row * 150);  // Position below pillars
        return { ...capability, position: { x, y } };
      }
      
      const parentPillarId = parentPillarRel.id;
      const parentPillar = capabilityData.find(c => c.id === parentPillarId);
      
      // For the first pass, we don't have position information yet
      // So we'll calculate positions based on index
      const pillarIndex = capabilityData.findIndex(c => c.id === parentPillarId);
      if (pillarIndex !== -1) {
        const pillarRow = Math.floor(pillarIndex / 3);
        const pillarCol = pillarIndex % 3;
        const parentX = 300 + (pillarCol * 500);
        const parentY = 100 + (pillarRow * 350);
        
        // Count how many functionalities already exist for this parent
        const functionalitiesForParent = capabilityData
          .filter(c => c.type === 'functionality' && 
                  c.dependencies?.some(dep => dep.type === 'parent-pillar' && dep.id === parentPillarId))
          .findIndex(c => c.id === capability.id);
        
        // Arrange functionalities in a more spaced out pattern
        if (functionalitiesForParent % 2 === 0) {
          // Even index - position to the left
          x = parentX - 350;  // More distance from parent
          y = parentY + 200 + (Math.floor(functionalitiesForParent / 2) * 150);  // More vertical spacing
        } else {
          // Odd index - position to the right
          x = parentX + 350;  // More distance from parent
          y = parentY + 200 + (Math.floor(functionalitiesForParent / 2) * 150);  // More vertical spacing
        }
      } else {
        // Fallback positioning if parent not found
        const row = Math.floor(index / 3);
        const col = index % 3;
        x = 300 + (col * 500);  // Match pillar spacing
        y = 650 + (row * 150);  // Position below pillars
      }
    }
  }
  
  return {
    ...capability,
    // Position based on the calculations above
    position: { 
      x: x, 
      y: y 
    }
  };
});

// Extract relationships
const relationships = capabilities.flatMap(capability => 
  (capability.dependencies || []).map(dep => ({
    source: capability.id,
    target: dep.id,
    type: dep.type
  }))
);

// Write consolidated data file
fs.writeFileSync(
  path.join(__dirname, '../static/blueprint-data.json'),
  JSON.stringify({ capabilities, relationships }, null, 2)
);

console.log(`Blueprint data extracted: ${capabilities.length} capabilities, ${relationships.length} relationships`);

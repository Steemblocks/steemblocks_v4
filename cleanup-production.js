#!/usr/bin/env node

/**
 * Enhanced Production Cleanup Script
 * Removes all console statements for production deployment
 * Usage: node cleanup-production.js
 */

const fs = require('fs');
const path = require('path');

// Files and patterns to clean
const srcDir = path.join(__dirname, 'src');
const excludeFiles = ['cleanup-production.js', 'reportWebVitals.js'];

function removeConsoleStatements(content) {
  let cleaned = content;
  
  // Remove all console.log statements (including multi-line ones)
  cleaned = cleaned.replace(/^\s*console\.log\([^;]*\);\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*console\.log\([^)]*\);\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*console\.log\([^)]*\n[^)]*\);\s*$/gm, '');
  
  // Remove debug comments with console.log
  cleaned = cleaned.replace(/^\s*console\.log\([^)]*\/\/ Debug[^)]*\);\s*$/gm, '');
  
  // Remove console.warn statements
  cleaned = cleaned.replace(/^\s*console\.warn\([^)]*\);\s*$/gm, '');
  
  // Keep critical console.error in UserContext but remove debug ones
  // Remove emoji-filled console.error statements
  cleaned = cleaned.replace(/^\s*console\.error\([^)]*['"`][^'"`]*[🚀📡✅📊✂️💾❌🔄⏳�️⏰🧹⏱️🔍💥🎉🌐][^)]*\);\s*$/gm, '');
  
  // Remove console.info and console.debug
  cleaned = cleaned.replace(/^\s*console\.(info|debug)\([^)]*\);\s*$/gm, '');
  
  // Clean up multiple empty lines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Remove trailing whitespace
  cleaned = cleaned.replace(/[ \t]+$/gm, '');
  
  return cleaned;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const cleaned = removeConsoleStatements(content);
  
  // Only write if content changed
  if (content !== cleaned) {
    fs.writeFileSync(filePath, cleaned);
    console.log(`✅ Cleaned: ${path.relative(process.cwd(), filePath)}`);
    
    // Count removed statements
    const originalLines = content.split('\n').filter(line => line.includes('console.')).length;
    const cleanedLines = cleaned.split('\n').filter(line => line.includes('console.')).length;
    if (originalLines > cleanedLines) {
      console.log(`   📉 Removed ${originalLines - cleanedLines} console statements`);
    }
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (!excludeFiles.includes(file)) {
        processFile(filePath);
      }
    }
  }
}

console.log('🧹 Starting enhanced production cleanup...');
console.log('📁 Cleaning directory:', srcDir);

try {
  walkDirectory(srcDir);
  console.log('✅ Enhanced production cleanup completed!');
  console.log('🚀 Your app is ready for production deployment!');
} catch (error) {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
}
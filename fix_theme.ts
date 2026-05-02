import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'src/components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Custom simple parser to replace text-white with text-text-primary where appropriate
  // But leaving Gradient/Blue buttons as text-white.
  
  // We can just replace all text-white with text-inverted
  content = content.replace(/text-white/g, 'text-inverted');
  // Then put it back for buttons with bg-gradient
  content = content.replace(/text-inverted(.*bg-gradient)/g, 'text-white$1');
  content = content.replace(/(bg-gradient.*)text-inverted/g, '$1text-white');
  
  content = content.replace(/bg-white\//g, 'bg-inverted/');
  content = content.replace(/border-white\//g, 'border-inverted/');
  
  fs.writeFileSync(filePath, content);
}
console.log('Fixed classes');

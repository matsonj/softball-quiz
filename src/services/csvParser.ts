import { PromptTemplate, Category } from '@/types';

export class CSVParser {
  static parsePromptTemplates(csvContent: string): PromptTemplate[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    if (headers.length !== 3 || headers[0] !== 'category' || headers[1] !== 'prompt_template' || headers[2] !== 'elo_target') {
      throw new Error('Invalid CSV format. Expected headers: category,prompt_template,elo_target');
    }
    
    const templates: PromptTemplate[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle CSV parsing with potential commas in the prompt_template field
      const parts = this.parseCSVLine(line);
      
      if (parts.length !== 3) {
        console.warn(`Skipping invalid line ${i + 1}: ${line}`);
        continue;
      }
      
      const category = parts[0] as Category;
      const prompt_template = parts[1];
      const elo_target = parseInt(parts[2]);
      
      if (!this.isValidCategory(category)) {
        console.warn(`Skipping invalid category on line ${i + 1}: ${category}`);
        continue;
      }
      
      if (isNaN(elo_target)) {
        console.warn(`Skipping invalid elo_target on line ${i + 1}: ${parts[2]}`);
        continue;
      }
      
      templates.push({
        category,
        prompt_template,
        elo_target
      });
    }
    
    return templates;
  }
  
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }
  
  private static isValidCategory(category: string): category is Category {
    return ['At Bat', 'Pitching', 'Fielding', 'On Base'].includes(category);
  }
}

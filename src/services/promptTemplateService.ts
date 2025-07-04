import { PromptTemplate, Category } from '@/types';
import { CSVParser } from './csvParser';
import fs from 'fs';
import path from 'path';

export class PromptTemplateService {
  private static templates: PromptTemplate[] = [];
  private static loaded = false;

  static async loadTemplates(): Promise<PromptTemplate[]> {
    if (this.loaded) {
      return this.templates;
    }

    try {
      const csvPath = path.join(process.cwd(), 'src/data/prompt-templates.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      this.templates = CSVParser.parsePromptTemplates(csvContent);
      this.loaded = true;
      return this.templates;
    } catch (error) {
      console.error('Error loading prompt templates:', error);
      return [];
    }
  }

  static getTemplatesForCategory(category: Category, userElo: number, excludeTemplates: string[] = []): PromptTemplate[] {
    const categoryTemplates = this.templates.filter(t => t.category === category);
    
    // Filter out already used templates
    const availableTemplates = categoryTemplates.filter(t => 
      !excludeTemplates.includes(t.prompt_template)
    );
    
    // Start with ideal Elo range (±50)
    let eloRange = 50;
    let matchingTemplates: PromptTemplate[] = [];
    
    // Gradually expand the range until we find templates
    while (matchingTemplates.length === 0 && eloRange <= 200) {
      matchingTemplates = availableTemplates.filter(t => 
        Math.abs(t.elo_target - userElo) <= eloRange
      );
      
      if (matchingTemplates.length === 0) {
        eloRange += 25;
      }
    }
    
    // If still no matches, return all available templates in the category
    if (matchingTemplates.length === 0) {
      matchingTemplates = availableTemplates;
    }
    
    return matchingTemplates;
  }

  static selectRandomTemplate(templates: PromptTemplate[]): PromptTemplate | null {
    if (templates.length === 0) return null;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  static selectTemplatesForQuiz(
    category: Category, 
    userElo: number, 
    count: number, 
    excludeTemplates: string[] = []
  ): PromptTemplate[] {
    const categoryTemplates = this.templates.filter(t => t.category === category);
    const availableTemplates = categoryTemplates.filter(t => 
      !excludeTemplates.includes(t.prompt_template)
    );
    
    console.log(`Available templates for ${category}: ${availableTemplates.length}`);
    
    // Start with ideal Elo range (±50) and expand until we have enough templates
    let eloRange = 50;
    let matchingTemplates: PromptTemplate[] = [];
    
    while (matchingTemplates.length < count && eloRange <= 500) {
      matchingTemplates = availableTemplates.filter(t => 
        Math.abs(t.elo_target - userElo) <= eloRange
      );
      
      console.log(`Elo range ±${eloRange}: Found ${matchingTemplates.length} templates`);
      
      if (matchingTemplates.length < count) {
        eloRange += 50; // Expand by 50 each time
      }
    }
    
    // If still not enough, just use all available templates for this category
    if (matchingTemplates.length < count) {
      console.log(`Using all available templates for ${category}: ${availableTemplates.length}`);
      matchingTemplates = availableTemplates;
    }
    
    // If we have fewer templates than requested questions, allow reuse by duplicating
    if (matchingTemplates.length < count && matchingTemplates.length > 0) {
      const needed = count - matchingTemplates.length;
      console.log(`Need ${needed} more templates, duplicating existing ones`);
      
      for (let i = 0; i < needed; i++) {
        const templateToReuse = matchingTemplates[i % matchingTemplates.length];
        matchingTemplates.push(templateToReuse);
      }
    }
    
    // Shuffle and select the requested number
    const shuffled = [...matchingTemplates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    console.log(`Final selection: ${selected.length} templates`);
    return selected;
  }
}

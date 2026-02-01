import Handlebars from 'handlebars';
import { IModels } from '~/connectionResolvers';

interface TemplateCache {
  data: any;
  timestamp: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
}

interface CacheStats {
  templatesCached: number;
  compiledTemplatesCached: number;
  cacheKeys: {
    templates: string[];
    compiled: string[];
  };
}

// Register Handlebars helpers
Handlebars.registerHelper('formatDate', function (date: Date | string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

Handlebars.registerHelper('formatCurrency', function (amount: number) {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
});

Handlebars.registerHelper('eq', function (a: any, b: any) {
  return a === b;
});

Handlebars.registerHelper('ne', function (a: any, b: any) {
  return a !== b;
});

Handlebars.registerHelper('gt', function (a: number, b: number) {
  return a > b;
});

Handlebars.registerHelper('lt', function (a: number, b: number) {
  return a < b;
});

Handlebars.registerHelper('uppercase', function (str: string) {
  return str ? str.toUpperCase() : '';
});

Handlebars.registerHelper('lowercase', function (str: string) {
  return str ? str.toLowerCase() : '';
});

Handlebars.registerHelper('capitalize', function (str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
});

class TemplateManager {
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate>;
  private templateCache: Map<string, TemplateCache>;

  constructor() {
    this.compiledTemplates = new Map();
    this.templateCache = new Map();
  }

  /**
   * Load template from database by insurance type
   */
  async loadTemplate(insuranceType: string, models: IModels): Promise<any> {
    try {
      const cacheKey = `template:${insuranceType}`;
      const cachedTemplate = this.templateCache.get(cacheKey);

      if (cachedTemplate) {
        const now = Date.now();
        if (now - cachedTemplate.timestamp < 5 * 60 * 1000) {
          return cachedTemplate.data;
        } else {
          this.templateCache.delete(cacheKey);
        }
      }

      const template = await models.Template.findOne({
        insuranceType,
        status: 'active',
      });

      if (!template) {
        throw new Error(
          `No active template found for insurance type: ${insuranceType}`,
        );
      }

      this.templateCache.set(cacheKey, {
        data: template,
        timestamp: Date.now(),
      });

      return template;
    } catch (error: any) {
      throw new Error(`Template loading error: ${error.message}`);
    }
  }

  /**
   * Compile Handlebars template
   */
  compileTemplate(
    htmlContent: string,
    cacheKey: string,
  ): HandlebarsTemplateDelegate {
    if (this.compiledTemplates.has(cacheKey)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.compiledTemplates.get(cacheKey)!;
    }

    try {
      const compiled = Handlebars.compile(htmlContent, {
        strict: false,
        noEscape: false,
      });

      this.compiledTemplates.set(cacheKey, compiled);
      return compiled;
    } catch (error: any) {
      throw new Error(`Template compilation error: ${error.message}`);
    }
  }

  /**
   * Generate complete HTML from contract data
   */
  async generateHTML(contract: any, model: IModels): Promise<string> {
    try {
      const template = await this.loadTemplate(contract.insuranceType, model);
      const cacheKey = `compiled:${template._id}:v${template.version}`;
      const compiledTemplate = this.compileTemplate(
        template.htmlContent,
        cacheKey,
      );

      const contractData = contract.toObject ? contract.toObject() : contract;
      const bodyHtml = compiledTemplate(contractData);

      const fullHtml = `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Contract ${contractData.contractNumber}</title>
                    <style>${template.cssContent}</style>
                </head>
                <body>
                    ${bodyHtml}
                </body>
            </html>`;

      return fullHtml;
    } catch (error: any) {
      console.error('HTML generation error:', error);
      throw new Error(`Failed to generate HTML: ${error.message}`);
    }
  }

  /**
   * Validate template syntax without saving
   */
  validateTemplate(
    htmlContent: string,
    sampleData: any = {},
  ): ValidationResult {
    try {
      const compiled = Handlebars.compile(htmlContent, {
        strict: false,
      });

      const result = compiled(sampleData);

      if (!result || result.trim().length === 0) {
        return {
          valid: false,
          error: 'Template produces empty output',
        };
      }

      return {
        valid: true,
        message: 'Template is valid',
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Preview template with sample data
   */
  previewTemplate(template: any, sampleData: any): string {
    try {
      const compiled = Handlebars.compile(template.htmlContent, {
        strict: false,
      });

      const bodyHtml = compiled(sampleData);

      return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Template Preview</title>
                    <style>${template.cssContent}</style>
                </head>
                    <body>
                     ${bodyHtml}
                    </body>
            </html>`;
    } catch (error: any) {
      throw new Error(`Preview generation error: ${error.message}`);
    }
  }

  /**
   * Clear cache for specific insurance type or all
   */
  clearCache(insuranceType: string | null = null): void {
    if (insuranceType) {
      const templateCacheKey = `template:${insuranceType}`;
      this.templateCache.delete(templateCacheKey);

      for (const key of this.compiledTemplates.keys()) {
        if (key.includes(insuranceType)) {
          this.compiledTemplates.delete(key);
        }
      }

      console.log(`Cache cleared for insurance type: ${insuranceType}`);
    } else {
      this.templateCache.clear();
      this.compiledTemplates.clear();
      console.log('All template caches cleared');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return {
      templatesCached: this.templateCache.size,
      compiledTemplatesCached: this.compiledTemplates.size,
      cacheKeys: {
        templates: Array.from(this.templateCache.keys()),
        compiled: Array.from(this.compiledTemplates.keys()),
      },
    };
  }

  /**
   * Register custom Handlebars helper
   */
  registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    Handlebars.registerHelper(name, fn);
  }
}

export default new TemplateManager();

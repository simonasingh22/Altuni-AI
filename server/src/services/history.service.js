import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../utils/logger.js';
import { ExternalAPIError } from '../utils/errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_DIR = path.resolve(__dirname, '../../../data/history');
const FILENAME_REGEX = /^\d+-[a-zA-Z0-9-]+\.json$/;

export class HistoryService {
  constructor(historyDir = HISTORY_DIR) {
    this.historyDir = historyDir;
  }

  async ensureDirectory() {
    try {
      await fs.mkdir(this.historyDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create history directory', { error: error.message });
      throw error;
    }
  }

  async saveAnalysis(analysis) {
    await this.ensureDirectory();

    const timestamp = Date.now();
    const ticker = (analysis.ticker || 'UNKNOWN').replace(/[^a-zA-Z0-9-]/g, '');
    const filename = `${timestamp}-${ticker}.json`;
    const filePath = path.join(this.historyDir, filename);

    logger.info('Saving analysis report to history file', { ticker, filename });

    try {
      await fs.writeFile(filePath, JSON.stringify(analysis, null, 2), 'utf-8');
      return filename;
    } catch (error) {
      logger.error('Failed to write history file', { filePath, error: error.message });
      throw new ExternalAPIError('Failed to save analysis data to disk', { cause: error });
    }
  }

  async getHistoryList() {
    try {
      await this.ensureDirectory();
      const files = await fs.readdir(this.historyDir);
      const historyList = [];

      for (const file of files) {
        if (!FILENAME_REGEX.test(file)) {
          continue;
        }

        const filePath = path.join(this.historyDir, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);

          // Extract timestamp from filename
          const [timestampStr] = file.split('-');
          const timestamp = new Date(parseInt(timestampStr, 10)).toISOString();

          historyList.push({
            id: file,
            company: data.company || 'Unknown Company',
            ticker: data.ticker || 'UNKNOWN',
            recommendation: data.recommendation || 'PASS',
            investmentScore: data.investmentScore ?? 0,
            timestamp
          });
        } catch (fileErr) {
          logger.warn('Skipping unreadable or malformed history file', { file, error: fileErr.message });
        }
      }

      // Sort by timestamp descending
      return historyList.sort((a, b) => b.id.localeCompare(a.id));
    } catch (error) {
      logger.error('Failed to read history list', { error: error.message });
      return [];
    }
  }

  async getAnalysisById(id) {
    // Validate id to prevent directory traversal
    if (!FILENAME_REGEX.test(id)) {
      logger.warn('Rejected invalid history ID request', { id });
      throw new Error('Invalid analysis record identifier format');
    }

    const filePath = path.join(this.historyDir, id);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      logger.error('Failed to load history file by ID', { id, error: error.message });
      throw new Error('Analysis record not found');
    }
  }
}

export const historyService = new HistoryService();

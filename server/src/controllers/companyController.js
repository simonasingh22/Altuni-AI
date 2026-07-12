import { companyResearchService } from '../services/companyResearch.service.js';
import { companyAnalysisService } from '../services/companyAnalysis.service.js';
import { historyService } from '../services/history.service.js';
import { logger } from '../utils/logger.js';

export async function getCompanyResearch(request, response) {
  const companyName = request.validated?.params?.companyName ?? request.params.companyName;
  const companyData = await companyResearchService.getCompanyResearch(companyName);

  response.status(200).json(companyData);
}

export async function getCompanyAnalysis(request, response) {
  const companyName = request.validated?.params?.companyName ?? request.params.companyName;
  const analysisData = await companyAnalysisService.getCompanyAnalysis(companyName);

  try {
    await historyService.saveAnalysis(analysisData);
  } catch (err) {
    logger.warn('Failed to save analysis data to history', { error: err.message });
  }

  response.status(200).json(analysisData);
}

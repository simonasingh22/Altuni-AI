import { historyService } from '../services/history.service.js';

export async function getHistoryList(request, response, next) {
  try {
    const list = await historyService.getHistoryList();
    response.status(200).json(list);
  } catch (error) {
    next(error);
  }
}

export async function getHistoryAnalysis(request, response, next) {
  try {
    const { id } = request.params;
    const analysis = await historyService.getAnalysisById(id);
    response.status(200).json(analysis);
  } catch (error) {
    next(error);
  }
}

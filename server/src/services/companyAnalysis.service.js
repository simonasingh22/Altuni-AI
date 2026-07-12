import { researchChain } from '../chains/research.chain.js';
import { investmentChain } from '../chains/investment.chain.js';

export class CompanyAnalysisService {
  constructor(rChain = researchChain, iChain = investmentChain) {
    this.rChain = rChain;
    this.iChain = iChain;
  }

  async getCompanyAnalysis(companyName) {
    const researchContext = await this.rChain.execute(companyName);
    const analysis = await this.iChain.execute(researchContext);
    return analysis;
  }
}

export const companyAnalysisService = new CompanyAnalysisService();

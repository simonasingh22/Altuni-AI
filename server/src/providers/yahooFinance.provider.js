import YahooFinance from 'yahoo-finance2';
import { companyNameSchema } from '../validators/companyName.validator.js';
import { AppError, NotFoundError, ValidationError } from '../utils/errors.js';

const yahooFinance = new YahooFinance({
	suppressNotices: ['yahooSurvey'],
	logger: {
		info: () => {},
		warn: () => {},
		error: () => {},
		debug: () => {},
		dir: () => {}
	}
});

const FINANCIAL_SUMMARY_MODULES = [
	'price',
	'summaryDetail',
	'financialData',
	'defaultKeyStatistics',
	'assetProfile',
	'summaryProfile',
	'incomeStatementHistory',
	'cashflowStatementHistory'
];

function normalizeInput(value) {
	const parsedResult = companyNameSchema.safeParse(value);

	if (!parsedResult.success) {
		throw new ValidationError('Invalid company name', parsedResult.error.flatten());
	}

	return parsedResult.data.trim();
}

function toNumber(value) {
	if (value == null) {
		return null;
	}

	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'object' && value.raw != null) {
		return toNumber(value.raw);
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value) {
	const numericValue = toNumber(value);
	return numericValue == null ? null : Math.trunc(numericValue);
}

function toStringValue(value) {
	if (value == null) {
		return null;
	}

	const stringValue = String(value).trim();
	return stringValue.length > 0 ? stringValue : null;
}

function firstDefined(...values) {
	for (const value of values) {
		if (value !== undefined && value !== null && value !== '') {
			return value;
		}
	}

	return null;
}

function formatHeadquarters(profile = {}) {
	const city = toStringValue(profile.city);
	const state = toStringValue(profile.state);
	const country = toStringValue(profile.country);

	const parts = [city, state, country].filter(Boolean);
	return parts.length > 0 ? parts.join(', ') : null;
}

function formatFounded(profile = {}, summaryProfile = {}) {
	const foundedValue = firstDefined(profile.founded, summaryProfile.founded, profile.startDate, summaryProfile.startDate);

	if (!foundedValue) {
		return null;
	}

	if (typeof foundedValue === 'string' && /^\d{4}$/.test(foundedValue.trim())) {
		return foundedValue.trim();
	}

	if (typeof foundedValue === 'string' && foundedValue.includes('-')) {
		return foundedValue.slice(0, 4);
	}

	return toStringValue(foundedValue);
}

function getOfficerName(companyOfficers = []) {
	if (!Array.isArray(companyOfficers)) {
		return null;
	}

	const officer = companyOfficers.find((entry) => /chief executive|ceo/i.test(entry?.title ?? '')) ?? companyOfficers[0];
	return toStringValue(officer?.name);
}

function extractModule(summary, moduleName) {
	return summary?.[moduleName] ?? summary?.result?.[0]?.[moduleName] ?? null;
}

function extractList(moduleValue, path) {
	const source = Array.isArray(moduleValue) ? moduleValue : moduleValue?.[path];
	return Array.isArray(source) ? source : [];
}

function selectBestSearchResult(results, query) {
	const candidates = Array.isArray(results)
		? results
		: Array.isArray(results?.quotes)
			? results.quotes
			: Array.isArray(results?.items)
				? results.items
				: [];

	if (candidates.length === 0) {
		return null;
	}

	const normalizedQuery = query.toLowerCase();

	const scoredCandidates = candidates.map((candidate, index) => {
		const symbol = toStringValue(candidate?.symbol)?.toLowerCase();
		const longName = toStringValue(candidate?.longname ?? candidate?.longName)?.toLowerCase();
		const shortName = toStringValue(candidate?.shortname ?? candidate?.shortName)?.toLowerCase();
		const normalizedQueryLength = normalizedQuery.length;

		let score = 0;

		if (symbol === normalizedQuery) {
			score += 200;
		}

		if (symbol?.startsWith(normalizedQuery)) {
			score += 150;
		}

		if (longName === normalizedQuery || shortName === normalizedQuery) {
			score += 90;
		}

		if (symbol?.includes(normalizedQuery)) {
			score += normalizedQueryLength <= 5 ? 100 : 70;
		}

		if (longName?.includes(normalizedQuery) || shortName?.includes(normalizedQuery)) {
			score += normalizedQueryLength <= 5 ? 20 : 35;
		}

		if ((candidate?.quoteType ?? '').toLowerCase() === 'equity') {
			score += 10;
		}

		score += Math.max(0, 20 - index);

		return {
			candidate,
			score
		};
	});

	scoredCandidates.sort((left, right) => right.score - left.score);
	return scoredCandidates[0]?.candidate ?? null;
}

function normalizeSearchResult(result) {
	return {
		company: toStringValue(result?.longname ?? result?.longName ?? result?.shortname ?? result?.shortName ?? result?.symbol),
		ticker: toStringValue(result?.symbol),
		exchange: toStringValue(result?.exchDisp ?? result?.exchange),
		quoteType: toStringValue(result?.quoteType),
		region: toStringValue(result?.region),
		score: toNumber(result?.score ?? result?.score?.raw)
	};
}

function buildUnavailableError(methodName, cause) {
	return new AppError(`Yahoo Finance is unavailable for ${methodName}`, {
		statusCode: 503,
		errorCode: 'YAHOO_FINANCE_UNAVAILABLE',
		details: {
			method: methodName
		},
		cause
	});
}

function getSummaryDetails(summary) {
	return extractModule(summary, 'summaryDetail') ?? {};
}

function getFinancialData(summary) {
	return extractModule(summary, 'financialData') ?? {};
}

function getKeyStatistics(summary) {
	return extractModule(summary, 'defaultKeyStatistics') ?? {};
}

function getPriceModule(summary) {
	return extractModule(summary, 'price') ?? {};
}

function getAssetProfile(summary) {
	return extractModule(summary, 'assetProfile') ?? {};
}

function getSummaryProfile(summary) {
	return extractModule(summary, 'summaryProfile') ?? {};
}

function getIncomeStatement(summary) {
	const moduleValue = extractModule(summary, 'incomeStatementHistory') ?? {};
	return extractList(moduleValue, 'incomeStatementHistory');
}

function getCashFlowStatement(summary) {
	const moduleValue = extractModule(summary, 'cashflowStatementHistory') ?? {};
	return extractList(moduleValue, 'cashflowStatementHistory');
}

function normalizeQuoteSummaryError(methodName, error) {
	if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof AppError) {
		return error;
	}

	return buildUnavailableError(methodName, error);
}

export class YahooFinanceProvider {
	constructor(client = yahooFinance) {
		this.client = client;
	}

	async searchCompany(companyName) {
		const normalizedCompanyName = normalizeInput(companyName);

		try {
			const searchResult = await this.client.search(normalizedCompanyName);
			const bestMatch = selectBestSearchResult(searchResult, normalizedCompanyName);

			if (!bestMatch) {
				throw new NotFoundError(`Company not found: ${normalizedCompanyName}`, {
					companyName: normalizedCompanyName
				});
			}

			return normalizeSearchResult(bestMatch);
		} catch (error) {
			if (error instanceof NotFoundError || error instanceof ValidationError) {
				throw error;
			}

			throw buildUnavailableError('searchCompany', error);
		}
	}

	async getCompanyProfile(ticker) {
		const normalizedTicker = normalizeInput(ticker);

		try {
			const summary = await this.client.quoteSummary(normalizedTicker, {
				modules: ['assetProfile', 'summaryProfile']
			});
			const assetProfile = getAssetProfile(summary);
			const summaryProfile = getSummaryProfile(summary);

			return {
				company: toStringValue(summaryProfile.longName ?? summaryProfile.shortName),
				ticker: normalizedTicker,
				industry: toStringValue(assetProfile.industry ?? summaryProfile.industry),
				sector: toStringValue(assetProfile.sector ?? summaryProfile.sector),
				headquarters: formatHeadquarters(assetProfile),
				ceo: getOfficerName(assetProfile.companyOfficers),
				founded: formatFounded(assetProfile, summaryProfile),
				employees: toInteger(assetProfile.fullTimeEmployees ?? summaryProfile.fullTimeEmployees)
			};
		} catch (error) {
			throw normalizeQuoteSummaryError('getCompanyProfile', error);
		}
	}

	async getFinancialHighlights(ticker) {
		const normalizedTicker = normalizeInput(ticker);

		try {
			const summary = await this.client.quoteSummary(normalizedTicker, {
				modules: FINANCIAL_SUMMARY_MODULES
			});

			const price = getPriceModule(summary);
			const summaryDetail = getSummaryDetails(summary);
			const financialData = getFinancialData(summary);
			const incomeHistory = getIncomeStatement(summary);
			const cashflowHistory = getCashFlowStatement(summary);

			const latestIncomeStatement = incomeHistory[0] ?? {};
			const latestCashFlowStatement = cashflowHistory[0] ?? {};

			const revenue = firstDefined(
				toNumber(latestIncomeStatement.totalRevenue),
				toNumber(financialData.totalRevenue),
				toNumber(summaryDetail.totalRevenue)
			);
			const netIncome = firstDefined(toNumber(latestIncomeStatement.netIncome), toNumber(financialData.netIncomeToCommon));
			const profitMarginRaw = firstDefined(
				toNumber(financialData.profitMargins),
				toNumber(summaryDetail.profitMargins),
				revenue != null && netIncome != null && revenue !== 0 ? netIncome / revenue : null
			);
			const cashFlow = firstDefined(
				toNumber(financialData.freeCashflow),
				toNumber(financialData.operatingCashflow),
				toNumber(latestCashFlowStatement.totalCashFromOperatingActivities),
				toNumber(latestCashFlowStatement.freeCashFlow)
			);

			return {
				marketCap: toNumber(price.marketCap ?? summaryDetail.marketCap),
				revenue,
				netIncome,
				profitMargin: profitMarginRaw == null ? null : Math.round(profitMarginRaw * 10000) / 100,
				cashFlow
			};
		} catch (error) {
			throw normalizeQuoteSummaryError('getFinancialHighlights', error);
		}
	}

	async getQuote(ticker) {
		const normalizedTicker = normalizeInput(ticker);

		try {
			const quote = await this.client.quote(normalizedTicker);

			return {
				ticker: normalizedTicker,
				currentPrice: toNumber(quote?.regularMarketPrice ?? quote?.postMarketPrice ?? quote?.preMarketPrice),
				currency: toStringValue(quote?.currency),
				marketCap: toNumber(quote?.marketCap)
			};
		} catch (error) {
			throw buildUnavailableError('getQuote', error);
		}
	}

	async getStatistics(ticker) {
		const normalizedTicker = normalizeInput(ticker);

		try {
			const summary = await this.client.quoteSummary(normalizedTicker, {
				modules: ['defaultKeyStatistics', 'financialData', 'summaryDetail', 'price']
			});
			const keyStatistics = getKeyStatistics(summary);
			const financialData = getFinancialData(summary);
			const summaryDetail = getSummaryDetails(summary);
			const price = getPriceModule(summary);

			return {
				peRatio: firstDefined(
					toNumber(keyStatistics.trailingPE),
					toNumber(summaryDetail.trailingPE),
					toNumber(price.trailingPE),
					toNumber(summaryDetail.forwardPE)
				),
				debtToEquity: firstDefined(
					toNumber(financialData.debtToEquity),
					toNumber(summaryDetail.debtToEquity)
				),
				roe: firstDefined(
					toNumber(financialData.returnOnEquity),
					toNumber(keyStatistics.returnOnEquity)
				)
			};
		} catch (error) {
			throw normalizeQuoteSummaryError('getStatistics', error);
		}
	}
}

export const yahooFinanceProvider = new YahooFinanceProvider();

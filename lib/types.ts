export interface AnalysisResult {
    extracted_text: string;
    page_number: number;
    explanation_of_relevance: string;
    confidence_score: number;
    audit_reasoning: string;
}

export interface AnalysisRequest {
    query: string;
    fileUrl: string;
}

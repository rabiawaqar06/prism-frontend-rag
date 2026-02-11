import { AnalysisResult } from "./types";

export const WEBHOOK_URL =
    process.env.NEXT_PUBLIC_WEBHOOK_URL || "placeholder";

export const MOCK_RESULTS: AnalysisResult[] = [
    {
        extracted_text:
            "The annual carbon emissions from the manufacturing sector decreased by 12.4% compared to the previous fiscal year, primarily driven by the adoption of renewable energy sources across 73% of production facilities.",
        page_number: 12,
        explanation_of_relevance:
            "This passage directly addresses the query about carbon emission reductions in manufacturing. It provides specific percentage figures and identifies the primary cause — renewable energy adoption.",
        confidence_score: 95,
        audit_reasoning:
            "High confidence because: (1) The extracted text contains exact numerical data matching the query topic. (2) The context surrounding this passage on page 12 consistently discusses emission metrics. (3) Key terms 'carbon emissions', 'decreased', and 'manufacturing sector' directly align with the search query. (4) No conflicting data found in adjacent sections.",
    },
    {
        extracted_text:
            "Investment in clean technology research and development totaled $4.2 billion in Q3 2025, representing a 28% increase year-over-year. Solar and wind energy projects accounted for 61% of total clean tech investments.",
        page_number: 27,
        explanation_of_relevance:
            "This section provides financial context for clean technology investments, which correlates with the document's broader discussion of sustainability initiatives and their funding sources.",
        confidence_score: 82,
        audit_reasoning:
            "Moderately high confidence because: (1) Financial figures are clearly stated and verifiable. (2) The passage is somewhat tangential to the primary query but provides important supporting context. (3) The 'clean technology' terminology partially overlaps with the search terms. (4) Page 27 is in the financial analysis section of the report.",
    },
    {
        extracted_text:
            "Water quality monitoring stations reported that 94% of tested water bodies met WHO safety standards, though regional disparities persist in areas near heavy industrial zones.",
        page_number: 45,
        explanation_of_relevance:
            "While not directly about emissions, this passage provides environmental quality metrics that contextualize the overall environmental impact assessment discussed in the document.",
        confidence_score: 64,
        audit_reasoning:
            "Moderate confidence because: (1) The passage relates to environmental monitoring, which is adjacent to but not directly about the queried topic. (2) Water quality data provides supplementary context. (3) The connection to the primary query requires inference rather than direct keyword matching. (4) Included because it contributes to a holistic understanding of the environmental report.",
    },
];

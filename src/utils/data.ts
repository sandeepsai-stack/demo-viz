// Example prompt data
export const promptExamples = [{
    type: 'simple',
    text: 'Who invented the telephone?',
    domain: 'general'
}, {
    type: 'complex',
    text: 'Trace the evolution of telecommunications from 1800s to 5G, highlighting key innovations and their economic impact.',
    domain: 'general'
}, {
    type: 'specialist',
    text: 'Draft a patent claim for a neural network algorithm that optimizes energy consumption in data centers.',
    domain: 'legal'
}, {
    type: 'specialist',
    text: 'Explain the symptoms, diagnosis criteria, and treatment options for rheumatoid arthritis.',
    domain: 'medical'
}, {
    type: 'specialist',
    text: 'Convert this Python script to Rust, optimizing for memory safety and performance.',
    domain: 'technical'
}, {
    type: 'simple',
    text: 'Explain photosynthesis in 2 sentences.',
    domain: 'general'
}];
// Model data
export const modelData = [{
    id: 'small-gen',
    name: 'SmallGPT',
    size: 'small',
    specialization: 'general',
    cost: 'low'
}, {
    id: 'med-gen',
    name: 'MediumGPT',
    size: 'medium',
    specialization: 'general',
    cost: 'medium'
}, {
    id: 'large-gen',
    name: 'LargeGPT',
    size: 'large',
    specialization: 'general',
    cost: 'high'
}, {
    id: 'legal-specialist',
    name: 'LegalGPT',
    size: 'medium',
    specialization: 'legal',
    cost: 'medium'
}, {
    id: 'medical-specialist',
    name: 'MedicalGPT',
    size: 'medium',
    specialization: 'medical',
    cost: 'medium'
}, {
    id: 'tech-specialist',
    name: 'TechGPT',
    size: 'medium',
    specialization: 'technical',
    cost: 'medium'
}];
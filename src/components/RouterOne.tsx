import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { promptExamples, modelData } from '../utils/data';
import { PlayIcon, PauseIcon, StepForwardIcon, StepBackIcon, RepeatIcon, BarChartIcon, CheckCircleIcon, ZapIcon, DollarSignIcon, TargetIcon, AlertCircleIcon, ChevronDownIcon, ChevronUpIcon, TableIcon } from 'lucide-react';
interface promptExample {
    type: string;
    text: string;
    domain: string;
};
interface modelData {
    id: string;
    name: string;
    size: string;
    specialization: string;
    cost: string;
};

export const RouterOne = () => {
    const [selectedPrompt, setSelectedPrompt] = useState<promptExample>(promptExamples[0]);
    const [selectedModel, setSelectedModel] = useState<modelData | null>(null);
    const [animationInProgress, setAnimationInProgress] = useState(false);
    const [autoPlayActive, setAutoPlayActive] = useState(false);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [showPerformanceComparison, setShowPerformanceComparison] = useState(false);
    const [showScores, setShowScores] = useState(false);
    const [showComparisonTable, setShowComparisonTable] = useState(false);
    const [showSavingsTable, setShowSavingsTable] = useState(false);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const performanceChartRef = useRef<SVGSVGElement | null>(null);
    const autoPlayTimerRef = useRef<number | NodeJS.Timeout | null>(null);
    // Performance data - simulated scores for each model on each prompt type
    const performanceData = {
        models: {
            SmallGPT: {
                simple: 0.95,
                complex: 0.45,
                legal: 0.3,
                medical: 0.25,
                technical: 0.35,
                average: 0.46
            },
            MediumGPT: {
                simple: 0.92,
                complex: 0.75,
                legal: 0.5,
                medical: 0.45,
                technical: 0.55,
                average: 0.63
            },
            LargeGPT: {
                simple: 0.9,
                complex: 0.88,
                legal: 0.7,
                medical: 0.65,
                technical: 0.75,
                average: 0.78
            },
            LegalGPT: {
                simple: 0.65,
                complex: 0.6,
                legal: 0.96,
                medical: 0.35,
                technical: 0.4,
                average: 0.59
            },
            MedicalGPT: {
                simple: 0.6,
                complex: 0.55,
                legal: 0.3,
                medical: 0.97,
                technical: 0.35,
                average: 0.55
            },
            TechGPT: {
                simple: 0.65,
                complex: 0.7,
                legal: 0.4,
                medical: 0.3,
                technical: 0.94,
                average: 0.6
            },
            Router: {
                simple: 0.95,
                complex: 0.88,
                legal: 0.96,
                medical: 0.97,
                technical: 0.94,
                average: 0.94
            }
        },
        promptTypes: ['simple', 'complex', 'legal', 'medical', 'technical']
    };
    // Cost data for models (relative units)
    const costData = {
        SmallGPT: 1,
        MediumGPT: 3,
        LargeGPT: 10,
        LegalGPT: 5,
        MedicalGPT: 5,
        TechGPT: 5,
        Router: 0.5 // Additional overhead for routing
    };
    // Calculate savings
    const calculateSavings = () => {
        // Distribution of prompt types in a typical workload (%)
        const promptDistribution = {
            simple: 50,
            complex: 20,
            legal: 10,
            medical: 10,
            technical: 10
        };
        // Calculate average cost per prompt for each approach
        const costs = {
            'Always SmallGPT': costData['SmallGPT'],
            'Always LargeGPT': costData['LargeGPT'],
            Router: 0
        };
        // Calculate router cost based on optimal model selection
        let routerCost = 0;
        Object.entries(promptDistribution).forEach(([type, percentage]) => {
            // Find the best model for this prompt type
            let bestModel = '';
            let bestScore = 0;
            Object.entries(performanceData.models).forEach(([model, scores]) => {
                if (model !== 'Router' && scores[type] > bestScore) {
                    bestScore = scores[type];
                    bestModel = model;
                }
            });
            // Add weighted cost
            routerCost += (costData[bestModel] + costData['Router']) * (percentage / 100);
        });
        costs['Router'] = routerCost;
        // Calculate performance for each approach
        const performance = {
            'Always SmallGPT': 0,
            'Always LargeGPT': 0,
            Router: 0
        };
        Object.entries(promptDistribution).forEach(([type, percentage]) => {
            performance['Always SmallGPT'] += performanceData.models['SmallGPT'][type] * (percentage / 100);
            performance['Always LargeGPT'] += performanceData.models['LargeGPT'][type] * (percentage / 100);
            performance['Router'] += performanceData.models['Router'][type] * (percentage / 100);
        });
        // Calculate savings compared to always using LargeGPT
        const savings = {
            'Cost Savings': (1 - costs['Router'] / costs['Always LargeGPT']) * 100,
            'Performance Improvement': (performance['Router'] - performance['Always LargeGPT']) * 100,
            'Efficiency Gain': performance['Router'] / costs['Router'] / (performance['Always LargeGPT'] / costs['Always LargeGPT']) * 100 - 100
        };
        return {
            costs,
            performance,
            savings,
            promptDistribution
        };
    };
    // Generate model scores for the current prompt
    const getModelScores = () => {
        if (!selectedPrompt) return [];
        let promptType = selectedPrompt.type === 'specialist' ? selectedPrompt.domain : selectedPrompt.type;
        return modelData.map(model => {
            // Get the score from performance data
            const modelName = model.name;
            const score = performanceData.models[modelName][promptType];
            // Add some randomization for visual interest
            const randomFactor = Math.random() * 0.05;
            const adjustedScore = Math.min(Math.max(score - randomFactor, 0), 1);
            return {
                id: model.id,
                name: model.name,
                size: model.size,
                specialization: model.specialization,
                cost: model.cost,
                score: adjustedScore,
                isSelected: selectedModel && selectedModel.id === model.id
            };
        }).sort((a, b) => b.score - a.score); // Sort by score descending
    };
    // Handle auto-play functionality
    useEffect(() => {
        if (autoPlayActive && !animationInProgress) {
            autoPlayTimerRef.current = setTimeout(() => {
                const nextIndex = (currentPromptIndex + 1) % promptExamples.length;
                setCurrentPromptIndex(nextIndex);
                setSelectedPrompt(promptExamples[nextIndex]);
            }, 3000); // Wait 3 seconds between prompts
        }
        return () => {
            if (autoPlayTimerRef.current) {
                clearTimeout(autoPlayTimerRef.current);
            }
        };
    }, [autoPlayActive, animationInProgress, currentPromptIndex]);
    // Determine the appropriate model for the selected prompt
    useEffect(() => {
        if (!selectedPrompt) return;
        setAnimationInProgress(true);
        setSelectedModel(null);
        setShowScores(true);
        // Simulate routing analysis (in real implementation this would be more complex)
        const timer = setTimeout(() => {
            let targetModel;
            if (selectedPrompt.type === 'simple') {
                targetModel = modelData.find(m => m.size === 'small' && m.specialization === 'general');
            } else if (selectedPrompt.type === 'complex') {
                targetModel = modelData.find(m => m.size === 'large' && m.specialization === 'general');
            } else if (selectedPrompt.type === 'specialist') {
                targetModel = modelData.find(m => m.specialization === selectedPrompt.domain);
            }
            setSelectedModel(targetModel);
            setAnimationInProgress(false);
            // Hide scores after decision is made
            setTimeout(() => {
                setShowScores(false);
            }, 2000);
        }, 2500); // Slightly longer delay to make animation more visible
        return () => clearTimeout(timer);
    }, [selectedPrompt]);
    // Navigation controls
    const handlePrevPrompt = () => {
        const prevIndex = (currentPromptIndex - 1 + promptExamples.length) % promptExamples.length;
        setCurrentPromptIndex(prevIndex);
        setSelectedPrompt(promptExamples[prevIndex]);
    };
    const handleNextPrompt = () => {
        const nextIndex = (currentPromptIndex + 1) % promptExamples.length;
        setCurrentPromptIndex(nextIndex);
        setSelectedPrompt(promptExamples[nextIndex]);
    };
    const toggleAutoPlay = () => {
        setAutoPlayActive(!autoPlayActive);
    };
    const resetDemo = () => {
        setCurrentPromptIndex(0);
        setSelectedPrompt(promptExamples[0]);
        setSelectedModel(null);
        setAnimationInProgress(false);
        setShowScores(false);
    };
    const togglePerformanceComparison = () => {
        setShowPerformanceComparison(!showPerformanceComparison);
    };
    const toggleComparisonTable = () => {
        setShowComparisonTable(!showComparisonTable);
    };
    const toggleSavingsTable = () => {
        setShowSavingsTable(!showSavingsTable);
    };
    // D3 visualization setup
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        const width = 1200;
        const height = 500;

        // Clear previous visualization
        svg.selectAll('*').remove();
        // Add a subtle gradient background for the visualization area
        const defs = svg.append('defs');
        // Create gradient for background
        const bgGradient = defs.append('linearGradient').attr('id', 'bg-gradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
        bgGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f8fafc');
        bgGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f1f5f9');
        // Create glows and shadows for elements
        const glowFilter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
        glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
        glowFilter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');
        // Add shadow filter
        const shadowFilter = defs.append('filter').attr('id', 'shadow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
        shadowFilter.append('feDropShadow').attr('dx', '0').attr('dy', '2').attr('stdDeviation', '3').attr('flood-color', 'rgba(0, 0, 0, 0.15)').attr('flood-opacity', '0.5');
        // Add background rect
        svg.append('rect').attr('width', width).attr('height', height).attr('fill', 'url(#bg-gradient)').attr('rx', 8).attr("opacity", 0.3);
        // Define model positions in a circular layout
        const modelPositions = [{
            x: width * 0.75,
            y: height * 0.25
        }, {
            x: width * 0.85,
            y: height * 0.45
        }, {
            x: width * 0.75,
            y: height * 0.65
        }, {
            x: width * 0.55,
            y: height * 0.8
        }, {
            x: width * 0.35,
            y: height * 0.8
        }, {
            x: width * 0.15,
            y: height * 0.65
        } // TechGPT
        ];
        // Create groups for different sections
        const routerGroup = svg.append('g').attr('transform', `translate(${width * 0.5}, ${height * 0.5})`);
        // Draw router with enhanced styling
        const routerRadius = 70;
        // Router outer glow
        if (animationInProgress) {
            routerGroup.append('circle').attr('r', routerRadius + 5).attr('fill', 'none').attr('stroke', '#6366F1').attr('stroke-width', 3).attr('opacity', 0.3).attr('filter', 'url(#glow)');
        }
        // Router outer circle with gradient
        const routerGradient = defs.append('radialGradient').attr('id', 'router-gradient').attr('cx', '0.4').attr('cy', '0.4').attr('r', '1');
        routerGradient.append('stop').attr('offset', '0%').attr('stop-color', animationInProgress ? '#4F46E5' : '#4B5563');
        routerGradient.append('stop').attr('offset', '100%').attr('stop-color', animationInProgress ? '#312E81' : '#1F2937');
        const router = routerGroup.append('circle').attr('r', routerRadius).attr('fill', 'url(#router-gradient)').attr('stroke', animationInProgress ? '#6366F1' : '#1F2937').attr('stroke-width', 2).attr('filter', 'url(#shadow)');
        if (animationInProgress) {
            router.transition().duration(750).attr('stroke', '#8B5CF6').transition().duration(750).attr('stroke', '#6366F1').on('end', function repeat() {
                if (animationInProgress) {
                    d3.select(this).transition().duration(750).attr('stroke', '#8B5CF6').transition().duration(750).attr('stroke', '#6366F1').on('end', repeat);
                }
            });
            // Add pulsing effect
            routerGroup.append('circle').attr('r', routerRadius).attr('fill', 'none').attr('stroke', '#6366F1').attr('stroke-width', 3).attr('opacity', 0.5).transition().duration(1500).attr('r', routerRadius + 15).attr('opacity', 0).on('end', function repeat() {
                if (animationInProgress) {
                    d3.select(this).attr('r', routerRadius).attr('opacity', 0.5).transition().duration(1500).attr('r', routerRadius + 15).attr('opacity', 0).on('end', repeat);
                } else {
                    d3.select(this).remove();
                }
            });
        }
        // Add router inner circle with gradient
        const innerRouterGradient = defs.append('radialGradient').attr('id', 'inner-router-gradient').attr('cx', '0.4').attr('cy', '0.4').attr('r', '1');
        innerRouterGradient.append('stop').attr('offset', '0%').attr('stop-color', '#374151');
        innerRouterGradient.append('stop').attr('offset', '100%').attr('stop-color', '#1F2937');
        routerGroup.append('circle').attr('r', routerRadius * 0.85).attr('fill', 'url(#inner-router-gradient)').attr('stroke', '#1F2937').attr('stroke-width', 1).attr('opacity', 0.9);
        // Add neural network inside router with enhanced styling
        const drawNeuralNetwork = () => {
            // Neural network parameters
            const inputNodes = 4;
            const hiddenLayers = 2;
            const hiddenNodes = [6, 5];
            const outputNodes = 6; // One for each model
            const nodeRadius = 3.5;
            const layerSpacing = routerRadius * 0.4;
            // Calculate layer positions
            const layers = [inputNodes, outputNodes];
            const layerOffsets = layers.map((_, i) => {
                return -layerSpacing + i * 2 * layerSpacing / (layers.length - 1);
            });
            // Create neural network container with a subtle background
            routerGroup.append('rect').attr('x', -routerRadius * 0.7).attr('y', -routerRadius * 0.5).attr('width', routerRadius * 1.4).attr('height', routerRadius).attr('rx', 10).attr('fill', '#2D3748').attr('opacity', 0.3);
            // Layer labels with better styling
            const layerLabels = ['Input', 'Output'];
            layerOffsets.forEach((x, i) => {
                // Only label first hidden layer
                const label = i === 1 || i === 2 ? `${layerLabels[i]} ${i}` : layerLabels[Math.min(i, layerLabels.length - 1)];
                routerGroup.append('text').attr('x', x).attr('y', -routerRadius * 0.55).attr('text-anchor', 'middle').attr('font-size', '9px').attr('font-weight', 'bold').attr('fill', '#D1D5DB').text(label);
            });
            // Draw connections first (so they're behind nodes)
            for (let layerIdx = 0; layerIdx < layers.length - 1; layerIdx++) {
                const sourceCount = layers[layerIdx];
                const targetCount = layers[layerIdx + 1];
                const sourceX = layerOffsets[layerIdx];
                const targetX = layerOffsets[layerIdx + 1];
                for (let i = 0; i < sourceCount; i++) {
                    const sourceY = (i - (sourceCount - 1) / 2) * routerRadius * 0.7 / Math.max(1, sourceCount - 1);
                    for (let j = 0; j < targetCount; j++) {
                        const targetY = (j - (targetCount - 1) / 2) * routerRadius * 0.7 / Math.max(1, targetCount - 1);
                        // Only draw some connections to avoid clutter
                        if (Math.random() > 0.3) {
                            // Create connection gradient
                            const connectionId = `connection-${layerIdx}-${i}-${j}`;
                            const connectionGradient = defs.append('linearGradient').attr('id', connectionId).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
                            // Connection strength - darker for stronger connections
                            const connectionStrength = Math.random();
                            const startColor = layerIdx === 0 ? '#10B981' : layerIdx === layers.length - 2 ? '#F59E0B' : '#6366F1';
                            const endColor = layerIdx === 0 ? '#6366F1' : layerIdx === layers.length - 2 ? '#6366F1' : '#8B5CF6';
                            connectionGradient.append('stop').attr('offset', '0%').attr('stop-color', startColor).attr('stop-opacity', connectionStrength * 0.6 + 0.2);
                            connectionGradient.append('stop').attr('offset', '100%').attr('stop-color', endColor).attr('stop-opacity', connectionStrength * 0.6 + 0.2);
                            routerGroup.append('line').attr('x1', sourceX).attr('y1', sourceY).attr('x2', targetX).attr('y2', targetY).attr('stroke', `url(#${connectionId})`).attr('stroke-width', connectionStrength * 1.2 + 0.3).attr('opacity', 0.7);
                            // Animate data flow if routing is in progress
                            if (animationInProgress && Math.random() > 0.65) {
                                const particleSize = Math.random() * 1.5 + 1;
                                routerGroup.append('circle').attr('cx', sourceX).attr('cy', sourceY).attr('r', particleSize).attr('fill', d3.interpolate(startColor, endColor)(0.5)).attr('opacity', 0.8).transition().duration(400 + Math.random() * 300).attr('cx', targetX).attr('cy', targetY).attr('opacity', 0).remove();
                            }
                        }
                    }
                }
            }
            // Draw nodes on top of connections with enhanced styling
            layers.forEach((nodeCount, layerIdx) => {
                const x = layerOffsets[layerIdx];
                // Different colors for different layers
                const nodeColors = ['#10B981', '#6366F1', '#8B5CF6', '#F59E0B'];
                const nodeColor = nodeColors[Math.min(layerIdx, nodeColors.length - 1)];
                for (let i = 0; i < nodeCount; i++) {
                    const y = (i - (nodeCount - 1) / 2) * routerRadius * 0.7 / Math.max(1, nodeCount - 1);
                    // Node activation state - brighter for active nodes
                    const isActive = animationInProgress && Math.random() > 0.4;
                    // Create node gradient
                    const nodeId = `node-${layerIdx}-${i}`;
                    const nodeGradient = defs.append('radialGradient').attr('id', nodeId).attr('cx', '0.3').attr('cy', '0.3').attr('r', '0.8');
                    nodeGradient.append('stop').attr('offset', '0%').attr('stop-color', isActive ? d3.color(nodeColor).brighter(0.8) : d3.color(nodeColor).brighter(0.3));
                    nodeGradient.append('stop').attr('offset', '100%').attr('stop-color', isActive ? nodeColor : d3.color(nodeColor).darker(0.3));
                    // Node circle with gradient
                    routerGroup.append('circle').attr('cx', x).attr('cy', y).attr('r', nodeRadius).attr('fill', `url(#${nodeId})`).attr('stroke', d3.color(nodeColor).darker(0.5)).attr('stroke-width', 0.5).attr('opacity', isActive ? 1 : 0.85);
                    // Add glow effect for active nodes
                    if (isActive) {
                        routerGroup.append('circle').attr('cx', x).attr('cy', y).attr('r', nodeRadius * 1.8).attr('fill', nodeColor).attr('opacity', 0.15).attr('filter', 'url(#glow)');
                    }
                    // Pulse animation for some nodes during routing
                    if (animationInProgress && Math.random() > 0.7) {
                        routerGroup.append('circle').attr('cx', x).attr('cy', y).attr('r', nodeRadius).attr('fill', 'none').attr('stroke', nodeColor).attr('stroke-width', 1.5).attr('opacity', 0.7).transition().duration(1000 + Math.random() * 500).attr('r', nodeRadius * 3).attr('opacity', 0).remove();
                    }
                }
            });
        };
        drawNeuralNetwork();
        // Add router label with better styling
        routerGroup.append('text').attr('text-anchor', 'middle').attr('dy', routerRadius + 15).attr('fill', '#000').attr('font-size', '14px').attr('font-weight', 'bold').attr('filter', 'url(#shadow)').text('Router');
        // Add router analysis label with better styling
        if (animationInProgress) {
            routerGroup.append('text').attr('text-anchor', 'middle').attr('dy', routerRadius + 35).attr('fill', '#6366F1').attr('font-size', '14px').attr('font-weight', 'bold').attr('filter', 'url(#shadow)').text('Analyzing prompt...');
            routerGroup.append('text').attr('text-anchor', 'middle').attr('dy', -routerRadius - 15).attr('fill', '#6366F1').attr('font-size', '14px').attr('filter', 'url(#shadow)').text('Computing model scores');
        }
        // Draw models with enhanced styling
        modelData.forEach((model, i) => {
            const position = modelPositions[i];
            const modelGroup = svg.append('g').attr('transform', `translate(${position.x}, ${position.y})`).attr('class', 'model-node').attr('data-id', model.id);
            // Size based on capability
            const radius = model.size === 'small' ? 30 : model.size === 'medium' ? 40 : 50;
            // Color based on specialization with better gradients
            const baseColor = model.specialization === 'general' ? '#3B82F6' : model.specialization === 'legal' ? '#EF4444' : model.specialization === 'medical' ? '#10B981' : model.specialization === 'technical' ? '#F59E0B' : '#8B5CF6';
            // Create model gradient
            const modelGradientId = `model-gradient-${model.id}`;
            const modelGradient = defs.append('radialGradient').attr('id', modelGradientId).attr('cx', '0.3').attr('cy', '0.3').attr('r', '0.8');
            modelGradient.append('stop').attr('offset', '0%').attr('stop-color', d3.color(baseColor).brighter(0.5));
            modelGradient.append('stop').attr('offset', '100%').attr('stop-color', baseColor);
            // Check if this is the selected model
            const isSelected = selectedModel && selectedModel.id === model.id;
            // Add glow for selected model
            if (isSelected) {
                modelGroup.append('circle').attr('r', radius + 10).attr('fill', baseColor).attr('opacity', 0.15).attr('filter', 'url(#glow)');
            }
            // Model background with better styling
            modelGroup.append('circle').attr('r', radius + 5).attr('fill', 'white').attr('stroke', d3.color(baseColor).darker(0.3)).attr('stroke-width', 1.5).attr('opacity', 0.15).attr('filter', 'url(#shadow)');
            // Model circle with gradient
            const circle = modelGroup.append('circle').attr('r', radius).attr('fill', `url(#${modelGradientId})`).attr('stroke', d3.color(baseColor).darker(0.3)).attr('stroke-width', isSelected ? 4 : 2).attr('opacity', isSelected ? 1 : 0.9).attr('filter', 'url(#shadow)');
            // Add highlight animation for selected model
            if (isSelected && !animationInProgress) {
                // Pulsing glow animation
                modelGroup.append('circle').attr('r', radius).attr('fill', 'none').attr('stroke', baseColor).attr('stroke-width', 3).attr('opacity', 0.5).transition().duration(1500).attr('r', radius + 15).attr('opacity', 0).on('end', function repeat() {
                    if (isSelected) {
                        d3.select(this).attr('r', radius).attr('opacity', 0.5).transition().duration(1500).attr('r', radius + 15).attr('opacity', 0).on('end', repeat);
                    }
                });
                circle.transition().duration(500).attr('r', radius + 3).transition().duration(500).attr('r', radius);
            }
            // Add model icon with enhanced styling
            const iconType = model.specialization === 'legal' ? 'legal' : model.specialization === 'medical' ? 'medical' : model.specialization === 'technical' ? 'technical' : 'general';
            // Icon background with better styling
            const iconBgGradientId = `icon-bg-gradient-${model.id}`;
            const iconBgGradient = defs.append('radialGradient').attr('id', iconBgGradientId).attr('cx', '0.3').attr('cy', '0.3').attr('r', '0.8');
            iconBgGradient.append('stop').attr('offset', '0%').attr('stop-color', 'white').attr('stop-opacity', 0.9);
            iconBgGradient.append('stop').attr('offset', '100%').attr('stop-color', 'white').attr('stop-opacity', 0.4);
            modelGroup.append('circle').attr('r', radius * 0.6).attr('fill', `url(#${iconBgGradientId})`);
            // Icon symbol with enhanced styling
            if (iconType === 'legal') {
                // Scale icon with better styling
                modelGroup.append('path').attr('d', 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z').attr('transform', `translate(-12, -12) scale(1.2)`).attr('fill', baseColor).attr('opacity', 0.9);
            } else if (iconType === 'medical') {
                // Medical cross with better styling
                modelGroup.append('path').attr('d', 'M19 3h-4V1h-6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 11c0 .55-.45 1-1 1s-1-.45-1-1v-3H6c-.55 0-1-.45-1-1s.45-1 1-1h3V6c0-.55.45-1 1-1s1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v3z').attr('transform', `translate(-12, -12) scale(1.2)`).attr('fill', baseColor).attr('opacity', 0.9);
            } else if (iconType === 'technical') {
                // Code brackets with better styling
                modelGroup.append('path').attr('d', 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z').attr('transform', `translate(-12, -12) scale(1.2)`).attr('fill', baseColor).attr('opacity', 0.9);
            } else {
                // Brain icon for general models with better styling
                const brainIconPath = 'M13.5,7a1.5,1.5,0,0,0,0-3h-6a1.5,1.5,0,0,0,0,3H9v2H4.5A1.5,1.5,0,0,0,3,10.5v4A1.5,1.5,0,0,0,4.5,16h6a1.5,1.5,0,0,0,0-3H9V11h6.5A1.5,1.5,0,0,0,17,9.5v-4A1.5,1.5,0,0,0,15.5,4h-6a1.5,1.5,0,0,0,0,3';
                modelGroup.append('path').attr('d', brainIconPath).attr('transform', `translate(-10, -10) scale(1)`).attr('fill', baseColor).attr('opacity', 0.9);
                // Size indicator dots with better styling
                const dots = model.size === 'small' ? 1 : model.size === 'medium' ? 2 : 3;
                const dotPositions = [-1, 0, 1].slice(0, dots);
                dotPositions.forEach(pos => {
                    modelGroup.append('circle').attr('cx', radius * 0.3).attr('cy', pos * radius * 0.25).attr('r', radius * 0.08).attr('fill', 'white').attr('opacity', 0.9);
                });
            }
            // Model name with better styling
            modelGroup.append('text').attr('text-anchor', 'middle').attr('dy', radius + 22).attr('fill', isSelected ? '#000' : '#1F2937').attr('font-weight', isSelected ? 'bold' : 'normal').attr('font-size', '15px').attr('filter', 'url(#shadow)').text(model.name);
            // Model description with better styling
            modelGroup.append('text').attr('text-anchor', 'middle').attr('dy', radius + 42).attr('fill', '#4B5563').attr('font-size', '13px').text(model.specialization !== 'general' ? `${model.specialization} specialist` : `${model.size} capability`);
            // Add cost indicator with better styling
            const costMarkers = model.cost === 'low' ? '$' : model.cost === 'medium' ? '$$' : '$$$';
            modelGroup.append('text').attr('text-anchor', 'middle').attr('dy', radius + 62).attr('fill', '#6B7280').attr('font-size', '13px').attr('font-weight', 'bold').text(costMarkers);
            // Add score indicator if we're analyzing
            if (showScores && animationInProgress) {
                const scores = getModelScores();
                const modelScore = scores.find(s => s.id === model.id);
                if (modelScore) {
                    const scoreWidth = 80;
                    const scoreHeight = 10;
                    // Score container with better styling
                    modelGroup.append('rect').attr('x', -scoreWidth / 2 - 10).attr('y', -radius - 55).attr('width', scoreWidth + 20).attr('height', 50).attr('rx', 8).attr('fill', 'white').attr('stroke', '#E5E7EB').attr('stroke-width', 1.5).attr('opacity', 0.95).attr('filter', 'url(#shadow)');
                    // Score label with better styling
                    modelGroup.append('text').attr('text-anchor', 'middle').attr('y', -radius - 35).attr('fill', '#1F2937').attr('font-size', '12px').attr('font-weight', 'bold').text('Match Score');
                    // Background bar with better styling
                    modelGroup.append('rect').attr('x', -scoreWidth / 2).attr('y', -radius - 20).attr('width', scoreWidth).attr('height', scoreHeight).attr('rx', 5).attr('fill', '#E5E7EB');
                    // Create score gradient
                    const scoreGradientId = `score-gradient-${model.id}`;
                    const scoreGradient = defs.append('linearGradient').attr('id', scoreGradientId).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
                    scoreGradient.append('stop').attr('offset', '0%').attr('stop-color', d3.color(baseColor).darker(0.2));
                    scoreGradient.append('stop').attr('offset', '100%').attr('stop-color', baseColor);
                    // Score bar with animation and better styling
                    modelGroup.append('rect').attr('x', -scoreWidth / 2).attr('y', -radius - 20).attr('width', 0).attr('height', scoreHeight).attr('rx', 5).attr('fill', `url(#${scoreGradientId})`).transition().delay(Math.random() * 300 + 500).duration(1500).ease(d3.easeCubicOut).attr('width', scoreWidth * modelScore.score);
                    // Score text with better styling
                    modelGroup.append('text').attr('text-anchor', 'middle').attr('y', -radius - 25).attr('fill', '#1F2937').attr('font-size', '13px').attr('font-weight', 'bold').text(`${(modelScore.score * 100).toFixed(0)}%`).attr('opacity', 0).transition().delay(2000).duration(500).attr('opacity', 1);
                    // Highlight the best model with better styling
                    if (scores[0].id === model.id) {
                        // Best match badge with better styling
                        const badgeWidth = 90;
                        const badgeHeight = 24;
                        modelGroup.append('rect').attr('x', -badgeWidth / 2).attr('y', -radius - 85).attr('width', badgeWidth).attr('height', badgeHeight).attr('rx', 12).attr('fill', '#10B981').attr('opacity', 0).attr('filter', 'url(#shadow)').transition().delay(2500).duration(300).attr('opacity', 0.9);
                        modelGroup.append('text').attr('text-anchor', 'middle').attr('y', -radius - 68).attr('fill', 'white').attr('font-size', '12px').attr('font-weight', 'bold').text('Best Match').attr('opacity', 0).transition().delay(2500).duration(300).attr('opacity', 1);
                        // Add checkmark icon
                        modelGroup.append('path').attr('d', 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z').attr('transform', `translate(-45, -radius - 79) scale(0.8)`).attr('fill', 'white').attr('opacity', 0).transition().delay(2700).duration(300).attr('opacity', 1);
                    }
                }
            }
        });
        // Draw the selected prompt with enhanced styling
        if (selectedPrompt) {
            // Create a prompt box at the top center with better styling
            const promptGroup = svg.append('g').attr('transform', `translate(${width * 0.5}, ${height * 0.12})`).attr('class', 'prompt');
            // Create prompt gradient
            const promptGradientId = 'prompt-gradient';
            const promptGradient = defs.append('linearGradient').attr('id', promptGradientId).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
            promptGradient.append('stop').attr('offset', '0%').attr('stop-color', '#F9FAFB');
            promptGradient.append('stop').attr('offset', '100%').attr('stop-color', '#F3F4F6');
            // Prompt container with better styling
            promptGroup.append('rect').attr('width', 420).attr('height', 105).attr('x', -210).attr('y', -55).attr('rx', 12).attr('fill', 'url(#prompt-gradient)').attr('stroke', animationInProgress ? '#6366F1' : '#9CA3AF').attr('stroke-width', animationInProgress ? 2 : 1.5).attr('filter', 'url(#shadow)');
            // Add type indicator with better styling
            const typeColor = selectedPrompt.type === 'simple' ? '#3B82F6' : selectedPrompt.type === 'complex' ? '#8B5CF6' : '#10B981';
            // Type indicator badge with better styling
            promptGroup.append('rect').attr('x', -95).attr('y', -45).attr('width', 145).attr('height', 22).attr('rx', 11).attr('fill', typeColor).attr('opacity', 0.15);
            promptGroup.append('circle').attr('cx', -85).attr('cy', -34).attr('r', 5).attr('fill', typeColor);
            promptGroup.append('text').attr('x', -75).attr('y', -30).attr('fill', d3.color(typeColor).darker(0.5)).attr('font-weight', 'bold').attr('font-size', '14px').text(`${selectedPrompt.type.charAt(0).toUpperCase() + selectedPrompt.type.slice(1)} Prompt`);
            // Truncate and wrap the prompt text with better styling
            const promptText = selectedPrompt.text.length > 65 ? selectedPrompt.text.substring(0, 62) + '...' : selectedPrompt.text;
            promptGroup.append('text').attr('text-anchor', 'middle').attr('x', 0).attr('y', 0).attr('fill', '#4B5563').attr('font-size', '13px').attr('font-weight', 'medium').text(promptText);
            // Add domain label for specialist prompts with better styling
            if (selectedPrompt.type === 'specialist') {
                const domainColor = selectedPrompt.domain === 'legal' ? '#EF4444' : selectedPrompt.domain === 'medical' ? '#10B981' : '#F59E0B';
                promptGroup.append('rect').attr('x', -45).attr('y', 15).attr('width', 90).attr('height', 24).attr('rx', 12).attr('fill', domainColor).attr('opacity', 0.2);
                promptGroup.append('text').attr('text-anchor', 'middle').attr('x', 0).attr('y', 32).attr('fill', d3.color(domainColor).darker(1)).attr('font-size', '13px').attr('font-weight', 'bold').text(selectedPrompt.domain);
            }
            // Draw connection from prompt to router with enhanced styling
            // Create path gradient
            const pathGradientId = 'prompt-path-gradient';
            const pathGradient = defs.append('linearGradient').attr('id', pathGradientId).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
            pathGradient.append('stop').attr('offset', '0%').attr('stop-color', animationInProgress ? '#818CF8' : '#9CA3AF');
            pathGradient.append('stop').attr('offset', '100%').attr('stop-color', animationInProgress ? '#6366F1' : '#6B7280');
            const promptToRouter = svg.append('path').attr('d', `M${width * 0.5},${height * 0.17} C${width * 0.5},${height * 0.25} ${width * 0.5},${height * 0.3} ${width * 0.5},${height * 0.5 - routerRadius}`).attr('fill', 'none').attr('stroke', `url(#${pathGradientId})`).attr('stroke-width', 2.5).attr('stroke-linecap', 'round').attr('marker-end', 'url(#arrow)');
            if (animationInProgress) {
                promptToRouter.attr('stroke-dasharray', '6,6').attr('stroke-dashoffset', 0).transition().duration(1500).ease(d3.easeLinear).attr('stroke-dashoffset', -60);
                // Add animated tokens flowing from prompt to router with better styling
                const animateTokens = () => {
                    const pathLength = promptToRouter.node().getTotalLength();
                    const tokenSize = Math.random() * 2 + 2;
                    const token = svg.append('circle').attr('r', tokenSize).attr('fill', '#6366F1').attr('filter', 'url(#glow)');
                    // Animate along the path with better easing
                    token.transition().duration(800).ease(d3.easeQuadInOut).attrTween('cx', function () {
                        return function (t) {
                            const p = promptToRouter.node().getPointAtLength(t * pathLength);
                            return p.x;
                        };
                    }).attrTween('cy', function () {
                        return function (t) {
                            const p = promptToRouter.node().getPointAtLength(t * pathLength);
                            return p.y;
                        };
                    }).on('end', function () {
                        d3.select(this).remove();
                        if (animationInProgress) {
                            setTimeout(animateTokens, Math.random() * 250 + 100);
                        }
                    });
                };
                // Start token animation
                animateTokens();
            }
        }
        // Draw connection from router to selected model with enhanced styling
        if (selectedModel && !animationInProgress) {
            const modelNode = svg.select(`.model-node[data-id="${selectedModel.id}"]`);
            const modelTransform = modelNode.attr('transform');
            const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(modelTransform);
            if (match) {
                const modelX = parseFloat(match[1]);
                const modelY = parseFloat(match[2]);
                // Calculate control points for a nice curve
                const routerX = width * 0.5;
                const routerY = height * 0.5;
                // Direction vector from router to model
                const dx = modelX - routerX;
                const dy = modelY - routerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                // Normalized direction vector
                const ndx = dx / distance;
                const ndy = dy / distance;
                // Control point offset perpendicular to the direction
                const perpX = -ndy * distance * 0.3;
                const perpY = ndx * distance * 0.3;
                // Control points
                const cp1x = routerX + ndx * routerRadius + perpX;
                const cp1y = routerY + ndy * routerRadius + perpY;
                const cp2x = modelX - ndx * 40 + perpX;
                const cp2y = modelY - ndy * 40 + perpY;
                // Create a path gradient for router to model
                const routerToModelGradientId = 'router-to-model-gradient';
                const routerToModelGradient = defs.append('linearGradient').attr('id', routerToModelGradientId).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%').attr('gradientUnits', 'userSpaceOnUse').attr('gradientTransform', `rotate(${Math.atan2(modelY - routerY, modelX - routerX) * 180 / Math.PI}, ${routerX}, ${routerY})`);
                routerToModelGradient.append('stop').attr('offset', '0%').attr('stop-color', '#6366F1');
                routerToModelGradient.append('stop').attr('offset', '100%').attr('stop-color', '#8B5CF6');
                // Create a curved path from router to selected model with better styling
                const path = svg.append('path').attr('d', `M${routerX + ndx * routerRadius},${routerY + ndy * routerRadius} C${cp1x},${cp1y} ${cp2x},${cp2y} ${modelX - ndx * 40},${modelY}`).attr('fill', 'none').attr('stroke', `url(#${routerToModelGradientId})`).attr('stroke-width', 3).attr('stroke-linecap', 'round').attr('marker-end', 'url(#arrow)').attr('opacity', 0).attr('filter', 'url(#shadow)');
                // Animate the path drawing with better easing
                const pathLength = path.node().getTotalLength();
                path.attr('stroke-dasharray', pathLength).attr('stroke-dashoffset', pathLength).attr('opacity', 1).transition().duration(1000).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0).on('end', function () {
                    // After path is drawn, show the routing rationale with better styling
                    const midX = (routerX + modelX) / 2;
                    const midY = (routerY + modelY) / 2;
                    const rationale = svg.append('g').attr('opacity', 0);
                    // Add background for better readability with enhanced styling
                    rationale.append('rect').attr('x', midX - 85).attr('y', midY - 45).attr('width', 170).attr('height', 115).attr('rx', 12).attr('fill', 'white').attr('stroke', '#E5E7EB').attr('stroke-width', 1.5).attr('opacity', 0.97).attr('filter', 'url(#shadow)');
                    // Routing decision title with better styling
                    rationale.append('text').attr('x', midX).attr('y', midY - 25).attr('text-anchor', 'middle').attr('fill', '#1F2937').attr('font-size', '13px').attr('font-weight', 'bold').text('Routing Decision');
                    // Routing strategy with better styling
                    const strategyBadgeWidth = 140;
                    const strategyBadgeHeight = 24;
                    rationale.append('rect').attr('x', midX - strategyBadgeWidth / 2).attr('y', midY - 5).attr('width', strategyBadgeWidth).attr('height', strategyBadgeHeight).attr('rx', 12).attr('fill', '#6366F1').attr('opacity', 0.15);
                    rationale.append('text').attr('x', midX).attr('y', midY + 10).attr('text-anchor', 'middle').attr('fill', '#6366F1').attr('font-size', '13px').attr('font-weight', 'bold').text(selectedPrompt.type === 'specialist' ? 'Specialist Alignment' : 'Capability Matching');
                    // Optimization goal with better styling
                    rationale.append('text').attr('x', midX).attr('y', midY + 32).attr('text-anchor', 'middle').attr('fill', '#4B5563').attr('font-size', '12px').attr('font-weight', 'medium').text(selectedPrompt.type === 'simple' ? 'Cost Optimized' : 'Quality Optimized');
                    // Score value with better styling
                    const scores = getModelScores();
                    const modelScore = scores.find(s => s.id === selectedModel.id);
                    if (modelScore) {
                        // Score badge with better styling
                        rationale.append('rect').attr('x', midX - 45).attr('y', midY + 37).attr('width', 90).attr('height', 24).attr('rx', 12).attr('fill', '#10B981').attr('opacity', 0.15);
                        rationale.append('text').attr('x', midX).attr('y', midY + 53).attr('text-anchor', 'middle').attr('fill', '#10B981').attr('font-size', '13px').attr('font-weight', 'bold').text(`Score: ${(modelScore.score * 100).toFixed(0)}%`);
                    }
                    // Animate rationale appearance with better easing
                    rationale.transition().duration(500).ease(d3.easeCubicOut).attr('opacity', 1);
                    // Animate tokens flowing from router to model with better styling
                    const animateTokens = () => {
                        const tokenPath = d3.select(this);
                        const point = tokenPath.node().getPointAtLength(0);
                        const token = svg.append('circle').attr('cx', point.x).attr('cy', point.y).attr('r', 4).attr('fill', '#6366F1').attr('filter', 'url(#glow)');
                        // Animate along the path with better easing
                        const animate = () => {
                            token.transition().duration(700).ease(d3.easeQuadInOut).attrTween('cx', function () {
                                return function (t) {
                                    const p = tokenPath.node().getPointAtLength(t * pathLength);
                                    return p.x;
                                };
                            }).attrTween('cy', function () {
                                return function (t) {
                                    const p = tokenPath.node().getPointAtLength(t * pathLength);
                                    return p.y;
                                };
                            }).on('end', function () {
                                d3.select(this).remove();
                            });
                        };
                        animate();
                    };
                    // Send several tokens with staggered timing
                    for (let i = 0; i < 6; i++) {
                        setTimeout(animateTokens, i * 180);
                    }
                });
            }
        }
        // Add arrow marker definition with better styling
        const arrowMarker = defs.append('marker').attr('id', 'arrow').attr('viewBox', '0 -5 10 10').attr('refX', 8).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto');
        // Create arrow gradient
        const arrowGradientId = 'arrow-gradient';
        const arrowGradient = defs.append('linearGradient').attr('id', arrowGradientId).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
        arrowGradient.append('stop').attr('offset', '0%').attr('stop-color', '#6366F1');
        arrowGradient.append('stop').attr('offset', '100%').attr('stop-color', '#8B5CF6');
        arrowMarker.append('path').attr('d', 'M0,-5L10,0L0,5Z').attr('fill', `url(#${arrowGradientId})`);
        // Add model score panel if analyzing with better styling
        if (showScores && animationInProgress) {
            const scores = getModelScores();
            const scorePanel = svg.append('g').attr('transform', `translate(${width * 0.15}, ${height * 0.5})`).attr('opacity', 0);
            // Score panel background with better styling
            scorePanel.append('rect').attr('x', -120).attr('y', -125 - scores.length * 12.5).attr('width', 290).attr('height', 60 + scores.length * 25).attr('rx', 12).attr('fill', 'white').attr('stroke', '#E5E7EB').attr('stroke-width', 1.5).attr('opacity', 0.97).attr('filter', 'url(#shadow)');
            // Panel title with better styling
            scorePanel.append('text').attr('x', 0).attr('y', -120 - scores.length * 12.5 + 25).attr('text-anchor', 'middle').attr('font-size', '15px').attr('font-weight', 'bold').attr('fill', '#1F2937').text('Model Scoring');
            // Column headers with better styling
            scorePanel.append('text').attr('x', -100).attr('y', -120 - scores.length * 12.5 + 45).attr('font-size', '12px').attr('font-weight', 'bold').attr('fill', '#4B5563').text('Model');
            scorePanel.append('text').attr('x', -20).attr('y', -120 - scores.length * 12.5 + 45).attr('font-size', '12px').attr('font-weight', 'bold').attr('fill', '#4B5563').text('Score');
            scorePanel.append('text').attr('x', 70).attr('y', -120 - scores.length * 12.5 + 45).attr('font-size', '12px').attr('font-weight', 'bold').attr('fill', '#4B5563').text('Features');
            // Separator line with better styling
            scorePanel.append('line').attr('x1', -110).attr('y1', -120 - scores.length * 12.5 + 50).attr('x2', 110).attr('y2', -20 - scores.length * 12.5 + 50).attr('stroke', '#E5E7EB').attr('stroke-width', 1.5);
            // Add each model score with better styling
            scores.forEach((score, i) => {
                const y = -120 - scores.length * 12.5 + 70 + i * 25;
                // Model name with specialization/size icon with better styling
                const modelIcon = score.specialization === 'legal' ? '⚖️' : score.specialization === 'medical' ? '🩺' : score.specialization === 'technical' ? '💻' : score.size === 'small' ? '🔹' : score.size === 'medium' ? '🔷' : '🔶';
                scorePanel.append('text').attr('x', -100).attr('y', y).attr('font-size', '13px').attr('fill', '#1F2937').text(`${modelIcon} ${score.name}`);
                // Score bar background with better styling
                scorePanel.append('rect').attr('x', -20).attr('y', y - 10).attr('width', 70).attr('height', 12).attr('rx', 6).attr('fill', '#E5E7EB');
                // Create score bar gradient
                const scoreBarGradientId = `score-bar-gradient-${i}`;
                const scoreBarGradient = defs.append('linearGradient').attr('id', scoreBarGradientId).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
                const barBaseColor = i === 0 ? '#10B981' : '#6366F1';
                scoreBarGradient.append('stop').attr('offset', '0%').attr('stop-color', d3.color(barBaseColor).darker(0.2));
                scoreBarGradient.append('stop').attr('offset', '100%').attr('stop-color', barBaseColor);
                // Score bar with animation and better styling
                scorePanel.append('rect').attr('x', -20).attr('y', y - 10).attr('width', 0).attr('height', 12).attr('rx', 6).attr('fill', `url(#${scoreBarGradientId})`).attr('opacity', i === 0 ? 1 : 0.8).transition().delay(i * 150 + 500).duration(1000).ease(d3.easeCubicOut).attr('width', 70 * score.score);
                // Score percentage with better styling
                scorePanel.append('text').attr('x', 60).attr('y', y).attr('text-anchor', 'end').attr('font-size', '13px').attr('font-weight', 'bold').attr('fill', '#1F2937').text(`${(score.score * 100).toFixed(0)}%`);
                // Features that influenced the score with better styling
                const featureText = score.specialization === selectedPrompt.domain ? 'Domain match' : selectedPrompt.type === 'simple' && score.size === 'small' ? 'Size optimized' : selectedPrompt.type === 'complex' && score.size === 'large' ? 'Capability match' : 'General purpose';
                scorePanel.append('text').attr('x', 70).attr('y', y).attr('font-size', '12px').attr('fill', '#6B7280').text(featureText);
                // Highlight best match with better styling
                if (i === 0) {
                    scorePanel.append('text').attr('x', -110).attr('y', y).attr('font-size', '14px').attr('font-weight', 'bold').attr('fill', '#10B981').text('✓').attr('opacity', 0).transition().delay(1500).duration(500).attr('opacity', 1);
                }
            });
            // Animate panel appearance with better easing
            scorePanel.transition().delay(300).duration(600).ease(d3.easeCubicOut).attr('opacity', 1);
        }
    }, [selectedPrompt, selectedModel, animationInProgress, showScores]);
    // Performance comparison chart
    useEffect(() => {
        if (!performanceChartRef.current || !showPerformanceComparison) return;
        const svg = d3.select(performanceChartRef.current);
        const margin = {
            top: 40,
            right: 40,
            bottom: 60,
            left: 60
        };
        const width = performanceChartRef.current.clientWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        // Clear previous chart
        svg.selectAll('*').remove();
        const chart = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
        // Define scales
        const xScale = d3.scaleBand().domain(performanceData.promptTypes).range([0, width]).padding(0.3);
        const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);
        // Define colors for models
        const colorScale = d3.scaleOrdinal().domain(Object.keys(performanceData.models)).range(['#3B82F6', '#818CF8', '#6366F1', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6' // Router - purple
        ]);
        // Draw axes
        chart.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(xScale).tickFormat(d => {
            const formatMap = {
                simple: 'Simple Queries',
                complex: 'Complex Queries',
                legal: 'Legal Prompts',
                medical: 'Medical Prompts',
                technical: 'Technical Prompts'
            };
            return formatMap[d];
        })).selectAll('text').attr('transform', 'rotate(-25)').attr('text-anchor', 'end').attr('dx', '-.8em').attr('dy', '.15em').attr('font-size', '12px');
        chart.append('g').call(d3.axisLeft(yScale).tickFormat(d => `${d * 100}%`));
        // Add y-axis label
        chart.append('text').attr('transform', 'rotate(-90)').attr('y', -margin.left + 20).attr('x', -height / 2).attr('text-anchor', 'middle').attr('font-size', '14px').attr('fill', '#4B5563').text('Performance Score');
        // Draw bars for each model
        const selectedModels = ['SmallGPT', 'LargeGPT', 'LegalGPT', 'MedicalGPT', 'TechGPT', 'Router'];
        const subGroupWidth = xScale.bandwidth() / selectedModels.length;
        selectedModels.forEach((model, i) => {
            const modelData = performanceData.models[model];
            performanceData.promptTypes.forEach(promptType => {
                chart.append('rect').attr('x', xScale(promptType) + i * subGroupWidth).attr('y', yScale(modelData[promptType])).attr('width', subGroupWidth).attr('height', height - yScale(modelData[promptType])).attr('fill', colorScale(model)).attr('stroke', 'white').attr('stroke-width', 1).attr('rx', 2).attr('opacity', model === 'Router' ? 1 : 0.7).on('mouseover', function () {
                    d3.select(this).attr('opacity', 1).attr('stroke-width', 2);
                    // Add tooltip
                    chart.append('text').attr('class', 'tooltip').attr('x', xScale(promptType) + i * subGroupWidth + subGroupWidth / 2).attr('y', yScale(modelData[promptType]) - 10).attr('text-anchor', 'middle').attr('font-size', '12px').attr('font-weight', 'bold').attr('fill', '#1F2937').text(`${(modelData[promptType] * 100).toFixed(0)}%`);
                }).on('mouseout', function () {
                    d3.select(this).attr('opacity', model === 'Router' ? 1 : 0.7).attr('stroke-width', 1);
                    chart.selectAll('.tooltip').remove();
                });
            });
        });
        // Add legend
        const legend = svg.append('g').attr('transform', `translate(${margin.left}, ${height + margin.top + 40})`);
        selectedModels.forEach((model, i) => {
            const legendItem = legend.append('g').attr('transform', `translate(${i * (width / selectedModels.length)}, 0)`);
            legendItem.append('rect').attr('width', 14).attr('height', 14).attr('rx', 2).attr('fill', colorScale(model));
            legendItem.append('text').attr('x', 20).attr('y', 12).attr('font-size', '12px').attr('fill', '#4B5563').text(model);
            // Highlight Router in legend
            if (model === 'Router') {
                legendItem.append('rect').attr('width', 70).attr('height', 20).attr('x', -5).attr('y', -3).attr('rx', 4).attr('fill', '#8B5CF6').attr('opacity', 0.1);
            }
        });
        // Add title
        svg.append('text').attr('x', margin.left + width / 2).attr('y', 20).attr('text-anchor', 'middle').attr('font-size', '16px').attr('font-weight', 'bold').attr('fill', '#1F2937').text('Performance Comparison: Router vs. Individual Models');
    }, [showPerformanceComparison]);
    // Calculate savings data
    const savingsData = calculateSavings();
    return (<div className="w-full bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-semibold mb-4">Prompt Router Demo:</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-600 mb-4 text-base">
                        Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
                    </p>
                    <p className="text-gray-600 mb-4 text-base">
                        Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
                    </p>
                    <p className="text-gray-600 mb-4 text-base">
                        Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
                    </p>
                </div>
                <div>
                    <div className="mb-8">
                        {/* Demo controls */}
                        <div className="bg-mt-gray flex items-center justify-between mb-6 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <button onClick={handlePrevPrompt} disabled={animationInProgress} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed" title="Previous prompt">
                                    <StepBackIcon size={20} />
                                </button>
                                <button onClick={toggleAutoPlay} disabled={animationInProgress} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed" title={autoPlayActive ? 'Pause demo' : 'Play demo'}>
                                    {autoPlayActive ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
                                </button>
                                <button onClick={handleNextPrompt} disabled={animationInProgress} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed" title="Next prompt">
                                    <StepForwardIcon size={20} />
                                </button>
                                <button onClick={resetDemo} className="p-2 rounded-full hover:bg-gray-200 ml-2" title="Reset demo">
                                    <RepeatIcon size={20} />
                                </button>
                                <button onClick={togglePerformanceComparison} className={`p-2 rounded-full hover:bg-gray-200 ml-4 ${showPerformanceComparison ? 'bg-indigo-100' : ''}`} title="Show performance comparison">
                                    <BarChartIcon size={20} />
                                </button>
                                <button onClick={toggleComparisonTable} className={`p-2 rounded-full hover:bg-gray-200 ml-1 ${showComparisonTable ? 'bg-indigo-100' : ''}`} title="Show comparison table">
                                    <TableIcon size={20} />
                                </button>
                            </div>
                            <div className="text-sm text-gray-500">
                                Prompt {currentPromptIndex + 1} of {promptExamples.length}
                                {animationInProgress && <span className="ml-2 text-indigo-500">Routing...</span>}
                            </div>
                        </div>
                        {/* Current prompt card */}
                        <div className="p-4 rounded-lg border-l-4 bg-mt-active-prompt mb-4">
                            <div className="flex items-center mb-2">
                                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${selectedPrompt.type === 'simple' ? 'bg-blue-500' : selectedPrompt.type === 'complex' ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                                <span className="font-medium text-gray-800">
                                    {selectedPrompt.type.charAt(0).toUpperCase() + selectedPrompt.type.slice(1)}{' '}
                                    Prompt
                                </span>
                                {selectedPrompt.type === 'specialist' && <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${selectedPrompt.domain === 'legal' ? 'bg-red-100 text-red-800' : selectedPrompt.domain === 'medical' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {selectedPrompt.domain}
                                </span>}
                            </div>
                            <p className="text-gray-700">{selectedPrompt.text}</p>
                        </div>
                        {/* All prompts list (collapsed) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
                            {promptExamples.map((prompt, index) => <div key={index} className={`p-3 rounded-lg cursor-pointer transition-all ${currentPromptIndex === index ? 'bg-mt-active-prompt border-2' : 'bg-mt-gray border-2 border-transparent hover:bg-gray-200'}`} onClick={() => {
                                setCurrentPromptIndex(index);
                                setSelectedPrompt(prompt);
                            }}>
                                <div className="flex items-center">
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${prompt.type === 'simple' ? 'bg-blue-500' : prompt.type === 'complex' ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                                    <span className="text-xs font-medium text-gray-800 truncate">
                                        {prompt.text.length > 40 ? prompt.text.substring(0, 37) + '...' : prompt.text}
                                    </span>
                                </div>
                            </div>)}
                        </div>
                    </div>
                    {/* Comparison Table */}
                    {showComparisonTable && <div className="mb-8 bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                <TableIcon size={18} className="inline mr-2" />
                                Model Comparison: Single Model vs. Router
                            </h3>
                            <button onClick={toggleComparisonTable} className="text-gray-500 hover:text-gray-700">
                                <ChevronUpIcon size={20} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prompt Type
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Distribution
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SmallGPT
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            LargeGPT
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50">
                                            Best Specialist
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Router
                                        </th>
                                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Improvement
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {performanceData.promptTypes.map((type, i) => {
                                        // Find best specialist model for this prompt type
                                        const specialists = ['LegalGPT', 'MedicalGPT', 'TechGPT'];
                                        const bestSpecialist = specialists.reduce((best, current) => {
                                            return performanceData.models[current][type] > performanceData.models[best][type] ? current : best;
                                        }, specialists[0]);
                                        const bestSpecialistScore = performanceData.models[bestSpecialist][type];
                                        const smallScore = performanceData.models['SmallGPT'][type];
                                        const largeScore = performanceData.models['LargeGPT'][type];
                                        const routerScore = performanceData.models['Router'][type];
                                        // Calculate improvement over LargeGPT
                                        const improvement = ((routerScore - largeScore) / largeScore * 100).toFixed(1);
                                        // Determine which model the router would use
                                        const routerChoice = type === 'simple' ? 'SmallGPT' : type === 'complex' ? 'LargeGPT' : type === 'legal' ? 'LegalGPT' : type === 'medical' ? 'MedicalGPT' : 'TechGPT';
                                        return <tr key={type} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {savingsData.promptDistribution[type]}%
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {(smallScore * 100).toFixed(0)}%
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {(largeScore * 100).toFixed(0)}%
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {(bestSpecialistScore * 100).toFixed(0)}% (
                                                {bestSpecialist})
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-700 bg-purple-50">
                                                {(routerScore * 100).toFixed(0)}%{' '}
                                                <span className="text-xs text-gray-500">
                                                    ({routerChoice})
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                                                +{improvement}%
                                            </td>
                                        </tr>;
                                    })}
                                    <tr className="bg-gray-100">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                            Average
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            100%
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {(performanceData.models['SmallGPT'].average * 100).toFixed(0)}
                                            %
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {(performanceData.models['LargeGPT'].average * 100).toFixed(0)}
                                            %
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {/* Average of best specialists would be router's performance */}
                                            {(performanceData.models['Router'].average * 100).toFixed(0)}
                                            %
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-purple-700 bg-purple-100">
                                            {(performanceData.models['Router'].average * 100).toFixed(0)}
                                            %
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600">
                                            +
                                            {((performanceData.models['Router'].average - performanceData.models['LargeGPT'].average) / performanceData.models['LargeGPT'].average * 100).toFixed(1)}
                                            %
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            <p className="mb-2">
                                <strong>Key Takeaway:</strong> The router selects the optimal
                                model for each prompt type, resulting in better performance than
                                any single model across all prompt types.
                            </p>
                            <p>
                                While LargeGPT performs well on average, it's outperformed by
                                specialists in their domains and wastes resources on simple
                                prompts.
                            </p>
                        </div>
                    </div>}
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-xl font-semibold mb-4">Routing Visualization:</h2>
                        <svg ref={svgRef} viewBox="0 0 1200 500" width="100%" height="500"></svg>
                    </div>
                    {/* Performance Comparison Section */}
                    {showPerformanceComparison && <div className="mb-8 border-t border-gray-200 pt-6">
                        <h2 className="text-xl font-semibold mb-2">
                            Performance Comparison:
                        </h2>
                        <p className="text-gray-600 mb-4">
                            See how the router outperforms any individual model by selecting the
                            optimal model for each task type.
                        </p>
                        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 mb-6">
                            <h3 className="font-medium text-purple-800 flex items-center mb-2">
                                <CheckCircleIcon size={18} className="mr-2" />
                                Why Routing Beats Any Single Model
                            </h3>
                            <p className="text-sm text-purple-700 mb-3">
                                No single model excels at every task. Even the best
                                general-purpose model (LargeGPT) underperforms compared to
                                specialists in their domains:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="flex items-center text-red-600 font-medium mb-1">
                                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                        Legal Queries
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>LargeGPT:</span>
                                        <span className="font-medium">70%</span>
                                    </div>
                                    <div className="flex justify-between items-center font-medium text-red-600">
                                        <span>LegalGPT:</span>
                                        <span>96%</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        +26% improvement
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="flex items-center text-green-600 font-medium mb-1">
                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                        Medical Queries
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>LargeGPT:</span>
                                        <span className="font-medium">65%</span>
                                    </div>
                                    <div className="flex justify-between items-center font-medium text-green-600">
                                        <span>MedicalGPT:</span>
                                        <span>97%</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        +32% improvement
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="flex items-center text-amber-600 font-medium mb-1">
                                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                                        Technical Queries
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>LargeGPT:</span>
                                        <span className="font-medium">75%</span>
                                    </div>
                                    <div className="flex justify-between items-center font-medium text-amber-600">
                                        <span>TechGPT:</span>
                                        <span>94%</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        +19% improvement
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-medium text-purple-800 mb-2">
                                    Overall Performance Comparison
                                </h4>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                        <div className="flex items-center mb-2 sm:mb-0">
                                            <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                                            <span className="font-medium">
                                                Best Single Model (LargeGPT):
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-32 h-5 bg-gray-200 rounded-full overflow-hidden mr-2">
                                                <div className="h-full bg-indigo-500" style={{
                                                    width: '78%'
                                                }}></div>
                                            </div>
                                            <span className="font-medium">78%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center mb-2 sm:mb-0">
                                            <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                                            <span className="font-medium">
                                                Router (Best for Each Task):
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-32 h-5 bg-gray-200 rounded-full overflow-hidden mr-2">
                                                <div className="h-full bg-purple-500" style={{
                                                    width: '94%'
                                                }}></div>
                                            </div>
                                            <span className="font-medium">94%</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        +16% overall improvement with routing
                                    </div>
                                </div>
                            </div>
                        </div>
                        <svg ref={performanceChartRef} viewBox="0 0 1200 500" width="100%"></svg>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-medium text-blue-800 mb-2">
                                    Optimal Resource Allocation
                                </h3>
                                <p className="text-sm text-blue-700">
                                    For simple queries, a small model is often sufficient. The
                                    router can direct these to SmallGPT, saving costs while
                                    maintaining high quality (95% performance).
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-medium text-green-800 mb-2">
                                    Domain Expertise
                                </h3>
                                <p className="text-sm text-green-700">
                                    Specialist models provide dramatically better results for
                                    domain-specific queries, with up to 32% improvement over even
                                    the largest general model.
                                </p>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg">
                                <h3 className="font-medium text-amber-800 mb-2">
                                    Intelligent Scaling
                                </h3>
                                <p className="text-sm text-amber-700">
                                    The router ensures complex queries receive the computational
                                    power they need, while avoiding wasting resources on simpler
                                    tasks.
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="font-medium text-purple-800 mb-2">
                                    Consistent Excellence
                                </h3>
                                <p className="text-sm text-purple-700">
                                    By always selecting the best model for each task type, the
                                    router delivers consistently superior results across all
                                    categories of prompts.
                                </p>
                            </div>
                        </div>
                    </div>}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <h2 className="text-xl font-semibold mb-4">Model Legend:</h2>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center">
                                <span className="inline-block w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                                <span className="text-sm">General Purpose</span>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-block w-4 h-4 rounded-full bg-red-500 mr-2"></span>
                                <span className="text-sm">Legal Specialist</span>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                                <span className="text-sm">Medical Specialist</span>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-block w-4 h-4 rounded-full bg-yellow-500 mr-2"></span>
                                <span className="text-sm">Technical Specialist</span>
                            </div>
                            <div className="flex items-center ml-8">
                                <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-1"></span>
                                <span className="inline-block w-4 h-4 rounded-full bg-gray-400 mr-1"></span>
                                <span className="inline-block w-5 h-5 rounded-full bg-gray-400 mr-2"></span>
                                <span className="text-sm">Size = Capability</span>
                            </div>
                        </div>
                    </div>
                    {/* Cost & Performance Savings Table */}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Cost & Performance Savings:</h2>
                            <button onClick={toggleSavingsTable} className="text-indigo-600 hover:text-indigo-800 flex items-center">
                                {showSavingsTable ? <>
                                    <ChevronUpIcon size={20} className="mr-1" />
                                    <span className="text-sm">Hide Details</span>
                                </> : <>
                                    <ChevronDownIcon size={20} className="mr-1" />
                                    <span className="text-sm">Show Details</span>
                                </>}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-mt-red p-4 rounded-lg border-l-4">
                                <div className="flex items-center mb-2">
                                    <DollarSignIcon size={20} className="mr-2" />
                                    <h3 className="font-medium">Cost Reduction</h3>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {savingsData.savings['Cost Savings'].toFixed(0)}%
                                </div>
                                <p className="text-sm text-white">
                                    Savings compared to always using LargeGPT by routing simple
                                    prompts to smaller models
                                </p>
                            </div>
                            <div className="bg-mt-green p-4 rounded-lg border-l-4">
                                <div className="flex items-center mb-2">
                                    <TargetIcon size={20} className="mr-2" />
                                    <h3 className="font-medium">Performance Gain</h3>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {savingsData.savings['Performance Improvement'].toFixed(1)}%
                                </div>
                                <p className="text-sm text-white">
                                    Improved accuracy by routing to specialized models for
                                    domain-specific prompts
                                </p>
                            </div>
                            <div className="bg-mt-yellow p-4 rounded-lg border-l-4">
                                <div className="flex items-center mb-2">
                                    <ZapIcon size={20} className="mr-2" />
                                    <h3 className="font-medium">Efficiency Boost</h3>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {savingsData.savings['Efficiency Gain'].toFixed(0)}%
                                </div>
                                <p className="text-sm text-white">
                                    Overall performance per unit cost compared to using a single model
                                </p>
                            </div>
                        </div>
                        {showSavingsTable && <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                            <h3 className="text-lg font-semibold mb-4">
                                Detailed Cost-Performance Analysis
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Approach
                                            </th>
                                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Relative Cost
                                            </th>
                                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Performance
                                            </th>
                                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Efficiency Ratio
                                            </th>
                                            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Notes
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                Always SmallGPT
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                1.0{' '}
                                                <span className="text-green-600 text-xs">(Lowest)</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {(performanceData.models['SmallGPT'].average * 100).toFixed(0)}
                                                %
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {(performanceData.models['SmallGPT'].average / savingsData.costs['Always SmallGPT']).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                Low cost but poor performance on complex/specialized tasks
                                            </td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                Always LargeGPT
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                10.0{' '}
                                                <span className="text-red-600 text-xs">(Highest)</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {(performanceData.models['LargeGPT'].average * 100).toFixed(0)}
                                                %
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {(performanceData.models['LargeGPT'].average / savingsData.costs['Always LargeGPT']).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                Good general performance but wastes resources on simple
                                                tasks
                                            </td>
                                        </tr>
                                        <tr className="bg-purple-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-900">
                                                Prompt Router
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-purple-900">
                                                {savingsData.costs['Router'].toFixed(1)}{' '}
                                                <span className="text-green-600 text-xs">
                                                    (
                                                    {(100 - savingsData.savings['Cost Savings']).toFixed(0)}
                                                    % of LargeGPT)
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-purple-900">
                                                {(performanceData.models['Router'].average * 100).toFixed(0)}
                                                %
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-purple-900">
                                                {(performanceData.models['Router'].average / savingsData.costs['Router']).toFixed(2)}{' '}
                                                <span className="text-green-600 text-xs">(Best)</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-purple-900">
                                                Optimal balance of cost and performance for each prompt
                                                type
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                                <div className="flex items-start">
                                    <AlertCircleIcon size={20} className="text-yellow-600 mr-2 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-yellow-800">
                                            Cost Calculation Methodology
                                        </h4>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Costs are calculated based on relative compute requirements:
                                            SmallGPT (1×), MediumGPT/Specialists (3-5×), LargeGPT (10×).
                                            The router adds a small overhead (0.5×) but saves
                                            significantly by sending prompts to the most cost-efficient
                                            model that can handle each task.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-mt-red p-4 rounded-lg">
                                <h3 className="font-medium text-white mb-2">
                                    Cost Optimization
                                </h3>
                                <p className="text-sm text-white">
                                    By routing simple prompts to smaller models, organizations can
                                    reduce compute costs while maintaining quality for straightforward
                                    tasks.
                                </p>
                            </div>
                            <div className="bg-mt-green p-4 rounded-lg">
                                <h3 className="font-medium text-white mb-2">
                                    Quality Improvement
                                </h3>
                                <p className="text-sm text-white">
                                    Specialist models provide more accurate and reliable responses for
                                    domain-specific queries, improving overall user experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    );
};
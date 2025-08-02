import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Prompt {
  id: number;
  text: string;
  type: string;
  targetModel: string;
  businessCase: string;
  savings: number;
  baselineCost: number;
  actualCost: number;
  icon: string;
  rationale: string; // Added missing property
}

interface Model {
  id: string;
  name: string;
  subtitle: string;
  size: number;
  color: string;
  gradient: string[];
  cost: string;
  x: number;
  y: number;
  monthlyVolume: string;
}

const RouterTwo = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'waiting' | 'incoming' | 'analyzing' | 'routing' | 'complete' | 'pause'>('waiting');
  const [totalSavings, setTotalSavings] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<NodeJS.Timeout[]>([]);

  // Business-friendly prompt examples with added rationale
  const prompts: Prompt[] = [
    {
      id: 1,
      text: "What's our Q3 revenue?",
      type: "simple",
      targetModel: "small-general",
      businessCase: "Quick factual queries",
      savings: 85,
      baselineCost: 0.015,
      actualCost: 0.002,
      icon: "📊",
      rationale: "Simple queries use our efficient model for fast responses at 1/10th the cost"
    },
    {
      id: 2,
      text: "Create a comprehensive market analysis report with competitor insights and 5-year projections",
      type: "complex",
      targetModel: "large-general",
      businessCase: "Deep analytical tasks",
      savings: 0,
      baselineCost: 0.015,
      actualCost: 0.015,
      icon: "📈",
      rationale: "Complex analytical tasks require our most advanced model for accurate results"
    },
    {
      id: 3,
      text: "Review and update our terms of service for GDPR compliance",
      type: "specialist",
      targetModel: "legal-specialist",
      businessCase: "Legal expertise required",
      savings: 45,
      baselineCost: 0.015,
      actualCost: 0.008,
      icon: "⚖️",
      rationale: "Legal documents require specialized model trained on regulatory compliance"
    },
    {
      id: 4,
      text: "Optimize our database queries for better performance",
      type: "specialist",
      targetModel: "coding-specialist",
      businessCase: "Technical optimization",
      savings: 30,
      baselineCost: 0.015,
      actualCost: 0.010,
      icon: "💻",
      rationale: "Technical optimizations need our coding-specialized model"
    },
    {
      id: 5,
      text: "Summarize yesterday's meeting notes",
      type: "simple",
      targetModel: "small-general",
      businessCase: "Basic summarization",
      savings: 85,
      baselineCost: 0.015,
      actualCost: 0.002,
      icon: "📝",
      rationale: "Simple summarization uses our cost-efficient model"
    },
    {
      id: 6,
      text: "Diagnose customer churn patterns from our CRM data",
      type: "specialist",
      targetModel: "analytics-specialist",
      businessCase: "Data science expertise",
      savings: 20,
      baselineCost: 0.015,
      actualCost: 0.012,
      icon: "🔍",
      rationale: "Analytics tasks require specialized data science model"
    }
  ];

  // Model definitions with business context
  const models: Model[] = [
    {
      id: "small-general",
      name: "Efficient AI",
      subtitle: "Perfect for simple tasks",
      size: 35,
      color: "#10B981",
      gradient: ["#34D399", "#10B981"],
      cost: "$",
      x: 720,
      y: 140,
      monthlyVolume: "1M+ queries"
    },
    {
      id: "large-general",
      name: "Advanced AI",
      subtitle: "Complex reasoning",
      size: 55,
      color: "#3B82F6",
      gradient: ["#60A5FA", "#3B82F6"],
      cost: "$$$",
      x: 720,
      y: 260,
      monthlyVolume: "100K queries"
    },
    {
      id: "legal-specialist",
      name: "Legal AI Expert",
      subtitle: "Compliance & contracts",
      size: 45,
      color: "#7C3AED",
      gradient: ["#A78BFA", "#7C3AED"],
      cost: "$$",
      x: 720,
      y: 380,
      monthlyVolume: "50K queries"
    },
    {
      id: "coding-specialist",
      name: "Code AI Expert",
      subtitle: "Development & optimization",
      size: 45,
      color: "#EC4899",
      gradient: ["#F472B6", "#EC4899"],
      cost: "$$",
      x: 870,
      y: 200,
      monthlyVolume: "200K queries"
    },
    {
      id: "analytics-specialist",
      name: "Analytics AI Expert",
      subtitle: "Business intelligence",
      size: 45,
      color: "#F59E0B",
      gradient: ["#FCD34D", "#F59E0B"],
      cost: "$$",
      x: 870,
      y: 320,
      monthlyVolume: "150K queries"
    }
  ];

  // Animation cycle with slower timing
  useEffect(() => {
    if (isPaused) return;

    // Clear any existing timeouts
    if (animationRef.current.length > 0) {
      animationRef.current.forEach(timeout => clearTimeout(timeout));
      animationRef.current = [];
    }

    const timeouts: NodeJS.Timeout[] = [];
    const addTimeout = (callback: () => void, delay: number) => {
      timeouts.push(setTimeout(callback, delay));
    };

    let delay = 1500; // initial wait

    addTimeout(() => {
      setAnimationPhase('incoming');
    }, delay);

    delay += 2000;

    addTimeout(() => {
      setAnimationPhase('analyzing');
    }, delay);

    delay += 3500;

    addTimeout(() => {
      setAnimationPhase('routing');
    }, delay);

    delay += 3500;

    addTimeout(() => {
      setAnimationPhase('complete');
      // Update metrics
      const prompt = prompts[activePromptIndex];
      setTotalSavings(prev => prev + (prompt.baselineCost - prompt.actualCost));
      setProcessedCount(prev => prev + 1);
    }, delay);

    delay += 4000;

    addTimeout(() => {
      setAnimationPhase('pause');
    }, delay);

    delay += 1000;

    addTimeout(() => {
      setAnimationPhase('waiting');
      setActivePromptIndex((prev) => (prev + 1) % prompts.length);
    }, delay);

    animationRef.current = timeouts;

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [activePromptIndex, isPaused]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 460;
    const activePrompt = prompts[activePromptIndex];

    // Definitions
    const defs = svg.append("defs");

    // Model gradients
    models.forEach(model => {
      const gradient = defs.append("radialGradient")
        .attr("id", `gradient-${model.id}`);
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", model.gradient[0])
        .attr("stop-opacity", 1);
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", model.gradient[1])
        .attr("stop-opacity", 0.8);
    });

    // Router gradient
    const routerGradient = defs.append("radialGradient")
      .attr("id", "router-gradient");
    routerGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#4F46E5")
      .attr("stop-opacity", 0.9);
    routerGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#6366F1")
      .attr("stop-opacity", 0.7);

    // Drop shadow filter
    const dropShadow = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    dropShadow.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", "3");
    dropShadow.append("feOffset")
      .attr("dx", "0")
      .attr("dy", "2")
      .attr("result", "offsetblur");
    dropShadow.append("feComponentTransfer")
      .append("feFuncA")
      .attr("type", "linear")
      .attr("slope", "0.2");
    const feMerge = dropShadow.append("feMerge");
    feMerge.append("feMergeNode");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Background pattern
    const pattern = defs.append("pattern")
      .attr("id", "grid-pattern")
      .attr("width", 40)
      .attr("height", 40)
      .attr("patternUnits", "userSpaceOnUse");
    pattern.append("circle")
      .attr("cx", 1)
      .attr("cy", 1)
      .attr("r", 0.5)
      .attr("fill", "#E5E7EB");

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#grid-pattern)")
      .attr("opacity", 0.3);

    // Step indicators
    const steps = [
      { phase: 'incoming', label: '1. Query Received', x: 180 },
      { phase: 'analyzing', label: '2. Analyzing', x: 430 },
      { phase: 'routing', label: '3. Routing', x: 600 },
      { phase: 'complete', label: '4. Processing', x: 800 }
    ];

    const stepGroup = svg.append("g");
    steps.forEach((step, i) => {
      const isActive = (
        (animationPhase === step.phase) ||
        (animationPhase === 'routing' && i < 3) ||
        (animationPhase === 'complete' && i <= 3) ||
        (animationPhase === 'pause' && i <= 3)
      );

      stepGroup.append("circle")
        .attr("cx", step.x)
        .attr("cy", 30)
        .attr("r", 8)
        .attr("fill", isActive ? "#4F46E5" : "#E5E7EB")
        .attr("transition", "all 0.5s");

      stepGroup.append("text")
        .attr("x", step.x)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("fill", isActive ? "#4F46E5" : "#9CA3AF")
        .attr("font-weight", isActive ? "600" : "400")
        .text(step.label);

      if (i < steps.length - 1) {
        stepGroup.append("line")
          .attr("x1", step.x + 8)
          .attr("y1", 30)
          .attr("x2", steps[i + 1].x - 8)
          .attr("y2", 30)
          .attr("stroke", isActive ? "#4F46E5" : "#E5E7EB")
          .attr("stroke-width", 2);
      }
    });

    // Prompt input area
    if (animationPhase !== 'waiting') {
      const promptGroup = svg.append("g");

      // Card background with slide-in animation
      const promptCard = promptGroup.append("rect")
        .attr("x", animationPhase === 'incoming' ? -320 : 30)
        .attr("y", 170)
        .attr("width", 300)
        .attr("height", 120)
        .attr("rx", 16)
        .attr("fill", "white")
        .attr("filter", "url(#drop-shadow)")
        .attr("opacity", animationPhase === 'incoming' ? 0 : 1);

      if (animationPhase === 'incoming') {
        promptCard.transition()
          .duration(1500)
          .ease(d3.easeQuadOut)
          .attr("x", 30)
          .attr("opacity", 1);
      }

      // Icon background
      promptGroup.append("circle")
        .attr("cx", 70)
        .attr("cy", 210)
        .attr("r", 20)
        .attr("fill", activePrompt.type === "simple" ? "#D1FAE5" :
          activePrompt.type === "complex" ? "#DBEAFE" : "#FEE2E2")
        .attr("opacity", animationPhase === 'incoming' ? 0 : 1)
        .transition()
        .delay(animationPhase === 'incoming' ? 800 : 0)
        .duration(600)
        .attr("opacity", 1);

      // Icon
      promptGroup.append("text")
        .attr("x", 70)
        .attr("y", 218)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text(activePrompt.icon)
        .attr("opacity", animationPhase === 'incoming' ? 0 : 1)
        .transition()
        .delay(animationPhase === 'incoming' ? 1000 : 0)
        .duration(600)
        .attr("opacity", 1);

      // Business case label
      promptGroup.append("text")
        .attr("x", 100)
        .attr("y", 205)
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .attr("fill", "#6B7280")
        .attr("text-transform", "uppercase")
        .attr("letter-spacing", "0.05em")
        .text(activePrompt.businessCase)
        .attr("opacity", animationPhase === 'incoming' ? 0 : 1)
        .transition()
        .delay(animationPhase === 'incoming' ? 1200 : 0)
        .duration(600)
        .attr("opacity", 1);

      // Prompt text with wrapping
      const words = activePrompt.text.split(' ');
      let line = '';
      let lineNumber = 0;
      const lineHeight = 16;
      const x = 100;
      const y = 225;
      const maxWidth = 210;

      const textGroup = promptGroup.append("g");

      words.forEach((word, i) => {
        const testLine = line + word + ' ';
        const testWidth = testLine.length * 7;

        if (testWidth > maxWidth && i > 0) {
          textGroup.append("text")
            .attr("x", x)
            .attr("y", y + (lineNumber * lineHeight))
            .attr("font-size", "13px")
            .attr("fill", "#1F2937")
            .text(line)
            .attr("opacity", animationPhase === 'incoming' ? 0 : 1)
            .transition()
            .delay(animationPhase === 'incoming' ? 1400 + lineNumber * 200 : 0)
            .duration(600)
            .attr("opacity", 1);

          line = word + ' ';
          lineNumber++;
        } else {
          line = testLine;
        }
      });

      if (line) {
        textGroup.append("text")
          .attr("x", x)
          .attr("y", y + (lineNumber * lineHeight))
          .attr("font-size", "13px")
          .attr("fill", "#1F2937")
          .text(line.trim())
          .attr("opacity", animationPhase === 'incoming' ? 0 : 1)
          .transition()
          .delay(animationPhase === 'incoming' ? 1400 + lineNumber * 200 : 0)
          .duration(600)
          .attr("opacity", 1);
      }
    }

    // Animated flow particles from prompt to router
    if (animationPhase === 'analyzing') {
      const particleGroup = svg.append("g");

      for (let i = 0; i < 8; i++) {
        particleGroup.append("circle")
          .attr("r", 4)
          .attr("fill", activePrompt.type === "simple" ? "#10B981" :
            activePrompt.type === "complex" ? "#3B82F6" : "#EC4899")
          .attr("opacity", 0.8)
          .attr("cx", 330)
          .attr("cy", 230)
          .transition()
          .delay(i * 300)
          .duration(1500)
          .ease(d3.easeQuadIn)
          .attr("cx", 360)
          .attr("opacity", 0)
          .remove();
      }
    }

    // Router
    const routerGroup = svg.append("g");

    // Router outer ring animation
    if (animationPhase === 'analyzing') {
      routerGroup.append("circle")
        .attr("cx", 430)
        .attr("cy", 230)
        .attr("r", 70)
        .attr("fill", "none")
        .attr("stroke", "#4F46E5")
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 0.5)
        .transition()
        .duration(1000)
        .attr("r", 85)
        .attr("opacity", 0)
        .remove();
    }

    // Main router circle
    const routerCircle = routerGroup.append("circle")
      .attr("cx", 430)
      .attr("cy", 230)
      .attr("r", 70)
      .attr("fill", "url(#router-gradient)")
      .attr("filter", "url(#drop-shadow)");

    // Pulsing effect during analysis
    if (animationPhase === 'analyzing') {
      routerCircle
        .transition()
        .duration(1500)
        .ease(d3.easeSinInOut)
        .attr("r", 75)
        .transition()
        .duration(1500)
        .attr("r", 70);
    }

    // Router icon - brain/network design
    const routerIcon = routerGroup.append("g")
      .attr("transform", "translate(430, 230)");

    // Neural network visualization
    const dots = [
      { x: 0, y: 0, size: 4 },
      { x: -15, y: -10, size: 3 },
      { x: 15, y: -10, size: 3 },
      { x: -15, y: 10, size: 3 },
      { x: 15, y: 10, size: 3 },
      { x: 0, y: -20, size: 3 },
      { x: 0, y: 20, size: 3 }
    ];

    // Animate dots during analysis
    dots.forEach((dot, i) => {
      const circle = routerIcon.append("circle")
        .attr("cx", dot.x)
        .attr("cy", dot.y)
        .attr("r", dot.size)
        .attr("fill", "white")
        .attr("opacity", 0.7);

      if (animationPhase === 'analyzing') {
        circle
          .transition()
          .delay(i * 150)
          .duration(500)
          .attr("opacity", 1)
          .attr("r", dot.size * 1.5)
          .transition()
          .duration(500)
          .attr("opacity", 0.7)
          .attr("r", dot.size);
      }
    });

    // Connecting lines
    routerIcon.selectAll(".connector")
      .data(dots.slice(1))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", d => d.x)
      .attr("y2", d => d.y)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", animationPhase === 'analyzing' ? 0.5 : 0.3);

    routerGroup.append("text")
      .attr("x", 430)
      .attr("y", 310)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("fill", "#4B5563")
      .text("AI Router");

    // Analyzing text
    if (animationPhase === 'analyzing') {
      const analyzingText = routerGroup.append("text")
        .attr("x", 430)
        .attr("y", 330)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#9CA3AF")
        .text("Analyzing complexity...")
        .attr("opacity", 0);

      analyzingText
        .transition()
        .duration(800)
        .attr("opacity", 1)
        .transition()
        .delay(2000)
        .duration(800)
        .attr("opacity", 0);
    }

    // Models
    const modelGroups = svg.selectAll(".model")
      .data(models)
      .enter()
      .append("g")
      .attr("class", "model");

    // Model circles with highlighting
    modelGroups.append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.size)
      .attr("fill", d => `url(#gradient-${d.id})`)
      .attr("filter", "url(#drop-shadow)")
      .attr("opacity", d => {
        if ((animationPhase === 'routing' || animationPhase === 'complete' || animationPhase === 'pause')
          && d.id === activePrompt.targetModel) {
          return 1;
        }
        return 0.6;
      })
      .transition()
      .duration(1000)
      .attr("r", d => {
        if ((animationPhase === 'routing' || animationPhase === 'complete' || animationPhase === 'pause')
          && d.id === activePrompt.targetModel) {
          return d.size * 1.15;
        }
        return d.size;
      });

    // Model icons
    const modelIcons: Record<string, string> = {
      "small-general": "⚡",
      "large-general": "🧠",
      "legal-specialist": "⚖️",
      "coding-specialist": "💻",
      "analytics-specialist": "📊"
    };

    modelGroups.append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text(d => modelIcons[d.id]);

    // Model labels
    modelGroups.append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y + d.size + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .text(d => d.name);

    modelGroups.append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y + d.size + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#6B7280")
      .text(d => d.subtitle);

    // Routing animation
    if (animationPhase === 'routing' || animationPhase === 'complete' || animationPhase === 'pause') {
      const targetModel = models.find(m => m.id === activePrompt.targetModel);
      if (!targetModel) return;

      // Calculate path
      const midX = (500 + targetModel.x) / 2;
      const midY = (230 + targetModel.y) / 2;

      const path = svg.append("path")
        .attr("d", `M 500 230 Q ${midX} ${midY - 30} ${targetModel.x - targetModel.size - 10} ${targetModel.y}`)
        .attr("fill", "none")
        .attr("stroke", targetModel.color)
        .attr("stroke-width", 3)
        .attr("opacity", 0.8);

      if (animationPhase === 'routing') {
        const totalLength = path.node()?.getTotalLength() || 0;
        path
          .attr("stroke-dasharray", totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(3000)
          .ease(d3.easeQuadInOut)
          .attr("stroke-dashoffset", 0);

        // Animated dot along path
        const dot = svg.append("circle")
          .attr("r", 8)
          .attr("fill", targetModel.color)
          .attr("filter", "url(#drop-shadow)");

        const pathNode = path.node();
        if (!pathNode) return;
        const pathLength = pathNode.getTotalLength();

        dot.transition()
          .duration(3000)
          .ease(d3.easeQuadInOut)
          .attrTween("transform", function () {
            return (t) => {
              const point = pathNode.getPointAtLength(t * pathLength);
              return `translate(${point.x}, ${point.y})`;
            };
          })
          .on("end", () => dot.remove());
      }
    }

    // Decision box
    if (animationPhase === 'complete' || animationPhase === 'pause') {
      const decisionGroup = svg.append("g");

      const decisionBox = decisionGroup.append("rect")
        .attr("x", 460)
        .attr("y", 70)
        .attr("width", 360)
        .attr("height", 100)
        .attr("rx", 12)
        .attr("fill", "white")
        .attr("stroke", "#E5E7EB")
        .attr("stroke-width", 1)
        .attr("filter", "url(#drop-shadow)")
        .attr("opacity", 0)
        .transition()
        .delay(500)
        .duration(800)
        .attr("opacity", 0.95);

      // Title
      decisionGroup.append("text")
        .attr("x", 640)
        .attr("y", 95)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .attr("fill", "#1F2937")
        .text("Routing Decision")
        .attr("opacity", 0)
        .transition()
        .delay(800)
        .duration(600)
        .attr("opacity", 1);

      // Rationale
      decisionGroup.append("text")
        .attr("x", 640)
        .attr("y", 115)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#4B5563")
        .text(activePrompt.rationale)
        .attr("opacity", 0)
        .transition()
        .delay(1000)
        .duration(600)
        .attr("opacity", 1);

      // Metrics with animation
      const metrics = [
        { label: "Cost:", value: `$${activePrompt.actualCost.toFixed(3)}`, color: "#059669", delay: 1200 },
        { label: "Savings:", value: `${activePrompt.savings}%`, color: "#DC2626", delay: 1400 },
        { label: "Model:", value: models.find(m => m.id === activePrompt.targetModel)?.name || "", color: "#7C3AED", delay: 1600 }
      ];

      metrics.forEach((metric, i) => {
        const metricGroup = decisionGroup.append("g");

        metricGroup.append("text")
          .attr("x", 490 + (i * 110))
          .attr("y", 145)
          .attr("font-size", "11px")
          .attr("fill", "#6B7280")
          .text(metric.label)
          .attr("opacity", 0)
          .transition()
          .delay(metric.delay)
          .duration(600)
          .attr("opacity", 1);

        metricGroup.append("text")
          .attr("x", 490 + (i * 110))
          .attr("y", 160)
          .attr("font-size", "13px")
          .attr("font-weight", "600")
          .attr("fill", metric.color)
          .text(metric.value)
          .attr("opacity", 0)
          .transition()
          .delay(metric.delay + 100)
          .duration(600)
          .attr("opacity", 1);
      });
    }

  }, [activePromptIndex, animationPhase, prompts, models]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    }).format(value);
  };

  const getPhaseDescription = () => {
    switch (animationPhase) {
      case 'incoming': return 'Receiving query from user...';
      case 'analyzing': return 'Analyzing query complexity and requirements...';
      case 'routing': return 'Finding optimal AI model for this query...';
      case 'complete': return 'Processing with selected model...';
      case 'pause': return 'Query complete. Preparing for next...';
      default: return 'System ready';
    }
  };

  return (
    <div className="w-full bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              AI Router Intelligence
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Watch how queries are intelligently routed to the right AI model in real-time
            </p>
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Cost Savings</span>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totalSavings)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                vs. always using premium models
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Queries Processed</span>
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-3xl font-bold text-indigo-600">
                {processedCount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                intelligently routed today
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Avg Response Time</span>
                <span className="text-2xl">🚀</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                0.8s
              </p>
              <p className="text-sm text-gray-500 mt-1">
                65% faster than baseline
              </p>
            </div>
          </div>

          {/* Main Visualization */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Live Routing Process
              </h2>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {isPaused ? 'Resume' : 'Pause'} Animation
              </button>
            </div>

            {/* Phase description */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full animate-pulse ${animationPhase === 'incoming' ? 'bg-blue-500' :
                    animationPhase === 'analyzing' ? 'bg-yellow-500' :
                      animationPhase === 'routing' ? 'bg-purple-500' :
                        animationPhase === 'complete' ? 'bg-green-500' :
                          'bg-gray-300'
                  }`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {getPhaseDescription()}
                </span>
              </div>
            </div>

            <svg ref={svgRef} width="100%" height="460" viewBox="0 0 1000 460"
              className="w-full rounded-lg bg-gradient-to-br from-gray-50 to-white">
            </svg>

            {/* Progress indicator */}
            <div className="mt-6 flex justify-center items-center gap-2">
              {prompts.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 transition-all duration-1000 ${index === activePromptIndex
                      ? 'w-12 bg-indigo-600 rounded-full'
                      : index < activePromptIndex
                        ? 'w-2 bg-indigo-300 rounded-full'
                        : 'w-2 bg-gray-300 rounded-full'
                    }`}
                />
              ))}
            </div>

            {/* Current prompt info */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Processing prompt {activePromptIndex + 1} of {prompts.length}:
              <span className="font-medium text-gray-800"> "{prompts[activePromptIndex].text}"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouterTwo;
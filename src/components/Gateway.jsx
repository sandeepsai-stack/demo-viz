import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as Chart from 'chart.js';

const Gateway = () => {
  const svgRef = useRef();
  const performanceChartRef = useRef();
  const costChartRef = useRef();
  // Add refs for chart instances
  const performanceChartInstanceRef = useRef(null);
  const costChartInstanceRef = useRef(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [networkHealth, setNetworkHealth] = useState('healthy');
  const [trafficMode, setTrafficMode] = useState('balanced');
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    totalRequests: 0,
    failoverEvents: 0,
    avgLatency: 145,
    costSavings: 23.5
  });

  const [providers, setProviders] = useState([
    { 
      id: 'openai', 
      name: 'OpenAI', 
      x: 120, 
      y: 80, 
      color: '#0C0C0C', 
      status: 'healthy', 
      load: 0.75,
      latency: 142,
      cost: 0.002,
      priority: 1,
      requests: 18450,
      failures: 12
    },
    { 
      id: 'anthropic', 
      name: 'Anthropic', 
      x: 480, 
      y: 80, 
      color: '#B17D1C', 
      status: 'healthy', 
      load: 0.65,
      latency: 156,
      cost: 0.0018,
      priority: 2,
      requests: 12340,
      failures: 8
    },
    { 
      id: 'google', 
      name: 'Google', 
      x: 120, 
      y: 320, 
      color: '#A73F2E', 
      status: 'degraded', 
      load: 0.45,
      latency: 203,
      cost: 0.0015,
      priority: 3,
      requests: 8920,
      failures: 45
    },
    { 
      id: 'cohere', 
      name: 'Cohere', 
      x: 480, 
      y: 320, 
      color: '#ef4444', 
      status: 'healthy', 
      load: 0.35,
      latency: 189,
      cost: 0.0022,
      priority: 4,
      requests: 5520,
      failures: 3
    }
  ]);

  const gateway = { x: 300, y: 200, radius: 50 };

  // Initialize charts
  useEffect(() => {
    // Performance Chart
    if (performanceChartRef.current) {
      // Destroy previous chart instance if exists
      if (performanceChartInstanceRef.current) {
        performanceChartInstanceRef.current.destroy();
      }
      const ctx = performanceChartRef.current.getContext('2d');
      performanceChartInstanceRef.current = new Chart.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          datasets: [{
            label: 'Avg Latency (ms)',
            data: [140, 145, 155, 142, 138, 150],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4
          }, {
            label: 'Success Rate (%)',
            data: [99.8, 99.9, 99.7, 99.8, 99.9, 99.8],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              position: 'left',
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              min: 99,
              max: 100,
              grid: {
                drawOnChartArea: false,
              },
            }
          }
        }
      });
    }

    // Cost Chart
    if (costChartRef.current) {
      // Destroy previous chart instance if exists
      if (costChartInstanceRef.current) {
        costChartInstanceRef.current.destroy();
      }
      const ctx = costChartRef.current.getContext('2d');
      costChartInstanceRef.current = new Chart.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['OpenAI', 'Anthropic', 'Google', 'Cohere'],
          datasets: [{
            data: [523.45, 389.12, 201.67, 133.59],
            backgroundColor: ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Cleanup function to destroy chart instances
    return () => {
      if (performanceChartInstanceRef.current) {
        performanceChartInstanceRef.current.destroy();
        performanceChartInstanceRef.current = null;
      }
      if (costChartInstanceRef.current) {
        costChartInstanceRef.current.destroy();
        costChartInstanceRef.current = null;
      }
    };
  }, []);

  // Advanced D3 Visualization
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    // Create advanced gradients and filters
    const defs = svg.append('defs');
    
    // Gateway gradient with animation
    const gatewayGradient = defs.append('radialGradient')
      .attr('id', 'gatewayGradient')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    
    gatewayGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#FF563F');
    
    gatewayGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FE9F90');

    // Glow filter
    const glow = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    
    glow.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    
    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create animated background particles
    const particles = svg.append('g').attr('class', 'particles');
    for (let i = 0; i < 20; i++) {
      const particle = particles.append('circle')
        .attr('cx', Math.random() * width)
        .attr('cy', Math.random() * height)
        .attr('r', Math.random() * 2 + 1)
        .attr('fill', '#e2e8f0')
        .attr('opacity', 0.3);

      particle.transition()
        .duration(3000 + Math.random() * 2000)
        .ease(d3.easeLinear)
        .attr('cx', Math.random() * width)
        .attr('cy', Math.random() * height)
        .attr('opacity', 0.1)
        .on('end', function repeat() {
          d3.select(this)
            .attr('cx', Math.random() * width)
            .attr('cy', Math.random() * height)
            .attr('opacity', 0.3)
            .transition()
            .duration(3000 + Math.random() * 2000)
            .ease(d3.easeLinear)
            .attr('cx', Math.random() * width)
            .attr('cy', Math.random() * height)
            .attr('opacity', 0.1)
            .on('end', repeat);
        });
    }

    // Create dynamic connections with load indicators
    const connections = svg.append('g').attr('class', 'connections');
    
    providers.forEach(provider => {
      const connectionGroup = connections.append('g')
        .attr('class', `connection-${provider.id}`);

      // Main connection line
      const connection = connectionGroup.append('line')
        .attr('x1', gateway.x)
        .attr('y1', gateway.y)
        .attr('x2', provider.x)
        .attr('y2', provider.y)
        .attr('stroke', provider.color)
        .attr('stroke-width', 2 + provider.load * 4)
        .attr('opacity', provider.status === 'healthy' ? 0.8 : 0.4)
        .attr('filter', provider.status === 'healthy' ? 'url(#glow)' : 'none');

      // Animated data flow
      if (isSimulating) {
        const flowInterval = setInterval(() => {
          const flow = connectionGroup.append('circle')
            .attr('cx', gateway.x)
            .attr('cy', gateway.y)
            .attr('r', 3)
            .attr('fill', provider.color)
            .attr('opacity', 0.8);

          flow.transition()
            .duration(1000 + Math.random() * 500)
            .ease(d3.easeQuadOut)
            .attr('cx', provider.x)
            .attr('cy', provider.y)
            .attr('r', 1)
            .attr('opacity', 0)
            .remove();
        }, 200 + Math.random() * 800);

        setTimeout(() => clearInterval(flowInterval), 30000);
      }

      // Load indicator
      const midX = (gateway.x + provider.x) / 2;
      const midY = (gateway.y + provider.y) / 2;
      
      const loadIndicator = connectionGroup.append('rect')
        .attr('x', midX - 20)
        .attr('y', midY - 8)
        .attr('width', 40)
        .attr('height', 16)
        .attr('fill', 'rgba(255, 255, 255, 0.9)')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 1)
        .attr('rx', 8);

      const loadBar = connectionGroup.append('rect')
        .attr('x', midX - 18)
        .attr('y', midY - 6)
        .attr('width', 0)
        .attr('height', 12)
        .attr('fill', provider.color)
        .attr('rx', 6);

      loadBar.transition()
        .duration(1000)
        .attr('width', 36 * provider.load);

      connectionGroup.append('text')
        .attr('x', midX)
        .attr('y', midY + 3)
        .attr('text-anchor', 'middle')
        .attr('fill', '#DDD7D7')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .style('text-shadow', '0px 1px 4px #000, 0px 0px 2px #000')
        .text(`${Math.round(provider.load * 100)}%`);
    });

    // Create enhanced provider nodes
    const providerNodes = svg.append('g').attr('class', 'providers');
    
    providers.forEach(provider => {
      const group = providerNodes.append('g')
        .attr('class', 'provider-group')
        .style('cursor', 'pointer');

      // Status ring
      group.append('circle')
        .attr('cx', provider.x)
        .attr('cy', provider.y)
        .attr('r', 35)
        .attr('fill', 'none')
        .attr('stroke', provider.status === 'healthy' ? '#10b981' : 
                       provider.status === 'degraded' ? '#f59e0b' : '#ef4444')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.6);

      // Animated pulse for healthy providers
      if (provider.status === 'healthy') {
        const pulse = group.append('circle')
          .attr('cx', provider.x)
          .attr('cy', provider.y)
          .attr('r', 35)
          .attr('fill', 'none')
          .attr('stroke', provider.color)
          .attr('stroke-width', 2)
          .attr('opacity', 0);

        pulse.transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('r', 50)
          .attr('opacity', 0.5)
          .transition()
          .attr('opacity', 0)
          .on('end', function repeat() {
            d3.select(this)
              .attr('r', 35)
              .transition()
              .duration(2000)
              .ease(d3.easeLinear)
              .attr('r', 50)
              .attr('opacity', 0.5)
              .transition()
              .attr('opacity', 0)
              .on('end', repeat);
          });
      }

      // Main provider circle
      const providerCircle = group.append('circle')
        .attr('cx', provider.x)
        .attr('cy', provider.y)
        .attr('r', 25)
        .attr('fill', provider.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('filter', 'url(#glow)')
        .on('mouseover', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 32)
            .attr('stroke-width', 4);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 25)
            .attr('stroke-width', 3);
        })
        .on('click', () => setSelectedProvider(provider));

      // Provider icon/text
      group.append('text')
        .attr('x', provider.x)
        .attr('y', provider.y + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(provider.name.substring(0, 3).toUpperCase());

      // Provider labels with metrics
      group.append('text')
        .attr('x', provider.x)
        .attr('y', provider.y + 50)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1f2937')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(provider.name);

      group.append('text')
        .attr('x', provider.x)
        .attr('y', provider.y + 65)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '9px')
        .text(`${provider.latency}ms • $${provider.cost}`);

      // Priority indicator
      group.append('circle')
        .attr('cx', provider.x + 25)
        .attr('cy', provider.y - 25)
        .attr('r', 8)
        .attr('fill', provider.priority <= 2 ? '#10b981' : '#f59e0b')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      group.append('text')
        .attr('x', provider.x + 25)
        .attr('y', provider.y - 22)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .text(provider.priority);
    });

    // Enhanced gateway node
    const gatewayGroup = svg.append('g').attr('class', 'gateway');
    
    // Gateway outer ring with rotation
    const outerRing = gatewayGroup.append('circle')
      .attr('cx', gateway.x)
      .attr('cy', gateway.y)
      .attr('r', gateway.radius + 10)
      .attr('fill', 'none')
      .attr('stroke', 'url(#gatewayGradient)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '10,5')
      .attr('opacity', 0.7);

    if (isSimulating) {
      outerRing.transition()
        .duration(3000)
        .ease(d3.easeLinear)
        .attrTween('stroke-dashoffset', () => d3.interpolate(0, -75))
        .on('end', function repeat() {
          d3.select(this)
            .transition()
            .duration(3000)
            .ease(d3.easeLinear)
            .attrTween('stroke-dashoffset', () => d3.interpolate(0, -75))
            .on('end', repeat);
        });
    }

    // Main gateway circle
    gatewayGroup.append('circle')
      .attr('cx', gateway.x)
      .attr('cy', gateway.y)
      .attr('r', gateway.radius)
      .attr('fill', 'url(#gatewayGradient)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 4)
      .attr('filter', 'url(#glow)')
      .style('cursor', 'pointer')
      .on('click', () => setIsSimulating(!isSimulating))
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', gateway.radius + 5);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', gateway.radius);
      });

    // Gateway text
    gatewayGroup.append('text')
      .attr('x', gateway.x)
      .attr('y', gateway.y - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('AI');

    gatewayGroup.append('text')
      .attr('x', gateway.x)
      .attr('y', gateway.y + 8)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('GATEWAY');

    // Gateway status indicator
    gatewayGroup.append('text')
      .attr('x', gateway.x)
      .attr('y', gateway.y + 75)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1f2937')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(`Status: ${networkHealth.toUpperCase()}`);

  }, [providers, isSimulating, networkHealth]);

  // Simulate network events
  const simulateNetworkEvent = useCallback(() => {
    const events = ['failover', 'recovery', 'load_spike', 'cost_optimization'];
    const event = events[Math.floor(Math.random() * events.length)];
    
    setProviders(prev => prev.map(provider => {
      if (event === 'failover' && provider.id === 'google') {
        return { ...provider, status: 'failed', load: 0 };
      } else if (event === 'recovery' && provider.status === 'failed') {
        return { ...provider, status: 'healthy', load: 0.3 };
      } else if (event === 'load_spike') {
        return { ...provider, load: Math.min(1, provider.load + Math.random() * 0.3) };
      }
      return provider;
    }));

    setRealTimeMetrics(prev => ({
      ...prev,
      totalRequests: prev.totalRequests + Math.floor(Math.random() * 100) + 50,
      failoverEvents: event === 'failover' ? prev.failoverEvents + 1 : prev.failoverEvents,
      avgLatency: 140 + Math.floor(Math.random() * 30),
      costSavings: 20 + Math.random() * 10
    }));
  }, []);

  // Auto-simulate events
  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(simulateNetworkEvent, 3000);
      return () => clearInterval(interval);
    }
  }, [isSimulating, simulateNetworkEvent]);

  const handleTrafficModeChange = (mode) => {
    setTrafficMode(mode);
    setProviders(prev => prev.map(provider => {
      switch (mode) {
        case 'cost_optimized':
          return { ...provider, priority: provider.cost < 0.002 ? 1 : 4 };
        case 'performance':
          return { ...provider, priority: provider.latency < 160 ? 1 : 4 };
        case 'balanced':
        default:
          return { ...provider, priority: ['openai', 'anthropic'].includes(provider.id) ? 1 : 3 };
      }
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                isSimulating 
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg' 
                  : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
              }`}
            >
              {isSimulating ? '⏹️ Stop Simulation' : '▶️ Start Simulation'}
            </button>
            
            <select
              value={trafficMode}
              onChange={(e) => handleTrafficModeChange(e.target.value)}
              className="px-4 py-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="balanced">Balanced Mode</option>
              <option value="cost_optimized">Cost Optimized</option>
              <option value="performance">Performance Mode</option>
            </select>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{realTimeMetrics.totalRequests.toLocaleString()}</div>
              <div className="text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{realTimeMetrics.failoverEvents}</div>
              <div className="text-gray-600">Failovers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{realTimeMetrics.avgLatency}ms</div>
              <div className="text-gray-600">Avg Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{realTimeMetrics.costSavings.toFixed(1)}%</div>
              <div className="text-gray-600">Cost Savings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        {/* Main Network Visualization */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">GATEWAY VISUALIZATION</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              networkHealth === 'healthy' ? 'bg-green-100 text-green-800' :
              networkHealth === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {networkHealth.toUpperCase()}
            </div>
          </div>
          
          <svg
            ref={svgRef}
            width="100%"
            height="400"
            viewBox="0 0 600 400"
            className="border rounded-lg bg-gradient-to-br from-slate-50 to-blue-50"
          />

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-1 bg-green-500 mr-2 rounded"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-1 bg-orange-500 mr-2 rounded"></div>
              <span>Low Priority</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Healthy</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Failed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gateway;
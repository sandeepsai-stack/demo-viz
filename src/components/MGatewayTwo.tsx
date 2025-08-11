import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MGatewayTwo = () => {
  const svgGatewayTwoRef = useRef(null);
  const [totalSaved, setTotalSaved] = useState(0);
  const [queryCount, setQueryCount] = useState(0);

  // Sample queries that users might ask
  const sampleQueries = [
    "What is the weather like today?",
    "How do I bake chocolate chip cookies?",
    "Explain quantum computing simply",
    "Write a haiku about spring",
    "What are the best practices for React?",
    "How does photosynthesis work?",
    "Tell me a joke about programming",
    "What's the capital of France?"
  ];

  // LLM providers with their properties
  const providers = [
    { id: 'chatgpt', name: 'ChatGPT', y: 150, color: '#236554', cost: 0.02 },
    { id: 'claude', name: 'Claude', y: 300, color: '#FF7D68', cost: 0.02 },
    { id: 'llama', name: 'Llama 8B', y: 450, color: '#A73F2E', cost: 0.02 }
  ];

  useEffect(() => {
    const svg = d3.select(svgGatewayTwoRef.current);
    const width = 1200;
    const height = 600;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Create gradient definitions
    const defs = svg.append('defs');

    // Gateway gradient
    const gatewayGradient = defs.append('linearGradient')
      .attr('id', 'gateway-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    gatewayGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4f46e5');

    gatewayGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#7c3aed');

    // Draw gateway
    const gateway = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    gateway.append('circle')
      .attr("r", 120)
      .attr('rx', 20)
      .attr("fill", "#0C0C0C")
      .attr("stroke", "#928E8B")
      .attr('stroke-width', 3);

    gateway.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -50)
      .attr('fill', 'white')
      .attr('font-size', '1.4em')
      .attr('font-weight', 'bold')
      .text('MARTIAN');

    gateway.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -20)
      .attr('fill', 'white')
      .attr('font-size', '1.4em')
      .attr('font-weight', 'bold')
      .text('GATEWAY');

    // Add gateway features text
    gateway.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 10)
      .attr('fill', 'white')
      .attr('font-size', '1.2em')
      .text('• Auto-retry');

    gateway.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 30)
      .attr('fill', 'white')
      .attr('font-size', '1.2em')
      .text('• Load balance');

    gateway.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 50)
      .attr('fill', 'white')
      .attr('font-size', '1.2em')
      .text('• Cost optimize');

    // Draw users section
    const usersGroup = svg.append('g')
      .attr('transform', 'translate(125, 250)');

    usersGroup.append('circle')
      .attr("r", 80)
      .attr("fill", "#FF563F")
      .attr("stroke", "#ffbfc2")
      .attr("stroke-width", 2);

    usersGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('y', 0)
      .attr("fill", "#fff")
      .attr('font-size', '1.4em')
      .attr('font-weight', 'bold')
      .text('User');

    // Draw providers
    providers.forEach(provider => {
      const providerGroup = svg.append('g')
        .attr('transform', `translate(1080, ${provider.y})`);

      providerGroup.append('circle')
        .attr('r', 60)
        .attr('width', 120)
        .attr('height', 60)
        .attr('rx', 10)
        .attr('fill', provider.color)
        .attr('opacity', 0.2);

      providerGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 5)
        .attr('font-size', '1em')
        .attr('font-weight', 'bold')
        .attr('fill', provider.color)
        .text(provider.name);

      providerGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 20)
        .attr('font-size', '0.875em')
        .attr('fill', '#6b7280')
        .text(`$${provider.cost}/query`);
    });

    // Draw connection lines
    svg.append('line')
      .attr('x1', 200)
      .attr('y1', 250)
      .attr('x2', width / 2 - 120)
      .attr('y2', height / 2)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    providers.forEach(provider => {
      svg.append('line')
        .attr('x1', width / 2 + 120)
        .attr('y1', height / 2)
        .attr('x2', 1018)
        .attr('y2', provider.y)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    });

    // Cost comparison box
    const costBox = svg.append('g')
      .attr('transform', 'translate(950, 50)');

    costBox.append('rect')
      .attr('x', -100)
      .attr('y', -30)
      .attr('width', 200)
      .attr('height', 80)
      .attr('rx', 10)
      .attr('fill', '#10b981')
      .attr('opacity', 0.1);

    costBox.append('rect')
      .attr('x', -100)
      .attr('y', -30)
      .attr('width', 200)
      .attr('height', 80)
      .attr('rx', 10)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2);

    costBox.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .attr('font-size', '1.4em')
      .attr('font-weight', 'bold')
      .attr('fill', '#047857')
      .text('Cost Savings');

    costBox.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 35)
      .attr('font-size', '1.5em')
      .attr('font-weight', 'bold')
      .attr('fill', '#10b981')
      .text('20%');

    // Reliability indicator
    const reliabilityBox = svg.append('g')
      .attr('transform', 'translate(100, 450)');

    reliabilityBox.append('rect')
      .attr('x', -80)
      .attr('y', -25)
      .attr('width', 240)
      .attr('height', 50)
      .attr('rx', 10)
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.1);

    reliabilityBox.append('rect')
      .attr('x', -80)
      .attr('y', -25)
      .attr('width', 240)
      .attr('height', 50)
      .attr('rx', 10)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2);

    reliabilityBox.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', 40)
      .attr('y', 0)
      .attr('font-size', '1em')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e40af')
      .text('Reliability Features');

    reliabilityBox.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', 40)
      .attr('y', 14)
      .attr('font-size', '1em')
      .attr('fill', '#6b7280')
      .text('Auto-retry on failure');

    // Total saved counter
    const savedCounter = svg.append('g')
      .attr('transform', 'translate(950, 520)');

    savedCounter.append('rect')
      .attr('x', -100)
      .attr('y', -25)
      .attr('width', 200)
      .attr('height', 50)
      .attr('rx', 10)
      .attr('fill', '#fbbf24')
      .attr('opacity', 0.1);

    savedCounter.append('rect')
      .attr('x', -100)
      .attr('y', -25)
      .attr('width', 200)
      .attr('height', 50)
      .attr('rx', 10)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2);

    savedCounter.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -5)
      .attr('font-size', '1em')
      .attr('font-weight', 'bold')
      .attr('fill', '#d97706')
      .text('Total Saved');

    savedCounter.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 18)
      .attr('font-size', '1.4em')
      .attr('font-weight', 'bold')
      .attr('fill', '#d97706')
      .attr('id', 'saved-amount')
      .text('$0');

    return () => {
      svg.selectAll('*').remove();
    };
  }, []);

  // Update saved amount display
  useEffect(() => {
    d3.select('#saved-amount').text(`$${totalSaved.toFixed(2)}`);
  }, [totalSaved]);

  // Animate query function
  const animateQuery = (query, shouldFail = false) => {
    const svg = d3.select(svgGatewayTwoRef.current);
    const queryId = Date.now();

    // Create query packet
    const packet = svg.append('g')
      .attr('class', 'query-packet')
      .attr('transform', 'translate(125, 250)');

    packet.append('rect')
      .attr('x', -40)
      .attr('y', -15)
      .attr('width', 80)
      .attr('height', 30)
      .attr('rx', 15)
      .attr('fill', '#6366f1')
      .attr('opacity', 0.8);

    packet.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .attr('fill', 'white')
      .attr('font-size', '1em')
      .text('Query');

    // Animate to gateway
    packet.transition()
      .duration(1000)
      .attr('transform', 'translate(600, 300)')
      .on('end', function () {
        if (shouldFail) {
          // Simulate failure to first provider
          const failedProvider = providers[0];

          packet.transition()
            .duration(800)
            .attr('transform', `translate(1018, ${failedProvider.y})`)
            .on('end', function () {
              // Show failure X
              const failX = svg.append('text')
                .attr('x', 1018)
                .attr('y', failedProvider.y)
                .attr('text-anchor', 'middle')
                .attr('font-size', '1.4em')
                .attr('fill', '#ef4444')
                .attr('opacity', 0)
                .text('✖');

              failX.transition()
                .duration(300)
                .attr('opacity', 1)
                .transition()
                .delay(500)
                .duration(300)
                .attr('opacity', 0)
                .remove();

              // Retry with different provider
              packet.transition()
                .delay(300)
                .duration(500)
                .attr('transform', 'translate(600, 300)')
                .transition()
                .duration(800)
                .attr('transform', `translate(1018, ${providers[2].y})`)
                .on('end', function () {
                  // Success checkmark
                  const successCheck = svg.append('text')
                    .attr('x', 1018)
                    .attr('y', providers[2].y)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '1.4em')
                    .attr('fill', '#10b981')
                    .attr('opacity', 0)
                    .text('✓');

                  successCheck.transition()
                    .duration(300)
                    .attr('opacity', 1)
                    .transition()
                    .delay(500)
                    .duration(300)
                    .attr('opacity', 0)
                    .remove();

                  packet.transition()
                    .delay(500)
                    .duration(1000)
                    .attr('transform', 'translate(125, 250)')
                    .attr('opacity', 0)
                    .remove();

                  // Update savings
                  setTotalSaved(prev => prev + 0.02);
                });
            });
        } else {
          // Normal successful routing
          const selectedProvider = providers[Math.floor(Math.random() * providers.length)];

          packet.transition()
            .duration(800)
            .attr('transform', `translate(1018, ${selectedProvider.y})`)
            .on('end', function () {
              // Success checkmark
              const successCheck = svg.append('text')
                .attr('x', 1018)
                .attr('y', selectedProvider.y)
                .attr('text-anchor', 'middle')
                .attr('font-size', '1.4em')
                .attr('fill', '#10b981')
                .attr('opacity', 0)
                .text('✓');

              successCheck.transition()
                .duration(300)
                .attr('opacity', 1)
                .transition()
                .delay(500)
                .duration(300)
                .attr('opacity', 0)
                .remove();

              packet.transition()
                .delay(500)
                .duration(1000)
                .attr('transform', 'translate(125, 250)')
                .attr('opacity', 0)
                .remove();

              // Update savings based on provider
              const savings = selectedProvider.cost;

              setTotalSaved((prev) => {
                return prev + savings;
              });
            });
        }
      });
  };

  // Auto-generate queries
  useEffect(() => {
    const interval = setInterval(() => {
      const query = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      const shouldFail = Math.random() < 0.2; // 20% chance of failure demo
      animateQuery(query, shouldFail);
      setQueryCount(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Martian Gateway: Intelligent LLM Routing
          </h1>
          <p className="text-lg text-gray-600">
            Watch how the gateway optimizes your AI queries in real-time
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <svg ref={svgGatewayTwoRef} className="w-full h-full" style={{ minHeight: '600px' }}></svg>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-mt-red rounded-lg p-4 text-center">
                <h3 className="font-semibold mb-1">Unified Interface</h3>
                <p className="text-sm text-white">Single API for all LLMs</p>
              </div>
              <div className="bg-mt-green rounded-lg p-4 text-center">
                <h3 className="font-semibold mb-1">Unified Billing</h3>
                <p className="text-sm text-white">One payment method for all providers.</p>
              </div>
              <div className="bg-mt-yellow rounded-lg p-4 text-center">
                <h3 className="font-semibold mb-1">99.9% Reliability</h3>
                <p className="text-sm text-white">Auto-retry & failover</p>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              Queries Processed: {queryCount} | Watch the red ✖ for failure demos and automatic retries
            </div>
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default MGatewayTwo;
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MGatewayOne = () => {
    const svgRef = useRef(null);
    const [queries, setQueries] = useState([]);
    const [totalSaved, setTotalSaved] = useState(0);
    const [queryCount, setQueryCount] = useState(0);

    const providers = [
        { id: 'chatgpt', name: 'ChatGPT', x: 700, y: 100, status: 'active', color: '#10a37f' },
        { id: 'claude', name: 'Claude', x: 700, y: 250, status: 'active', color: '#6b46c1' },
        { id: 'llama', name: 'Llama 8B', x: 700, y: 400, status: 'active', color: '#ff6b35' }
    ];

    const sampleQueries = [
        "What is the world position right now?",
        "Explain quantum computing simply",
        "How do I train a neural network?",
        "What's the weather forecast?",
        "Translate this to Spanish",
        "Debug my Python code"
    ];

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        // Clear previous content
        svg.selectAll("*").remove();

        // Define arrow markers
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 8)
            .attr("refY", 0)
            .attr("markerWidth", 8)
            .attr("markerHeight", 8)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#64748b");

        // Draw connections
        const connections = svg.append("g").attr("class", "connections");

        // User to Gateway connection
        connections.append("line")
            .attr("x1", 200)
            .attr("y1", 250)
            .attr("x2", 350)
            .attr("y2", 250)
            .attr("stroke", "#64748b")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)");

        // Gateway to Providers connections
        providers.forEach(provider => {
            connections.append("line")
                .attr("class", `gateway-to-${provider.id}`)
                .attr("x1", 550)
                .attr("y1", 250)
                .attr("x2", provider.x - 50)
                .attr("y2", provider.y)
                .attr("stroke", "#64748b")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5")
                .attr("marker-end", "url(#arrowhead)");
        });

        // Draw user
        const userGroup = svg.append("g")
            .attr("transform", "translate(100, 250)");

        userGroup.append("circle")
            .attr("r", 40)
            .attr("fill", "#f0f9ff")
            .attr("stroke", "#0ea5e9")
            .attr("stroke-width", 2);

        userGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 5)
            .attr("fill", "#0c4a6e")
            .style("font-size", "14px")
            .style("font-weight", "500")
            .text("User");

        // Draw Gateway
        const gatewayGroup = svg.append("g")
            .attr("transform", "translate(450, 250)");

        gatewayGroup.append("rect")
            .attr("x", -100)
            .attr("y", -60)
            .attr("width", 200)
            .attr("height", 120)
            .attr("fill", "#1e293b")
            .attr("stroke", "#3b82f6")
            .attr("stroke-width", 3)
            .attr("rx", 10);

        gatewayGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -20)
            .attr("fill", "#f8fafc")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Martian Gateway");

        gatewayGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 5)
            .attr("fill", "#94a3b8")
            .style("font-size", "12px")
            .text("Intelligent Router");

        // Reliability indicator
        gatewayGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 30)
            .attr("r", 8)
            .attr("fill", "#10b981");

        gatewayGroup.append("text")
            .attr("x", 15)
            .attr("y", 35)
            .attr("fill", "#94a3b8")
            .style("font-size", "11px")
            .text("99.9% Uptime");

        // Draw Providers
        providers.forEach(provider => {
            const providerGroup = svg.append("g")
                .attr("class", `provider-${provider.id}`)
                .attr("transform", `translate(${provider.x}, ${provider.y})`);

            providerGroup.append("rect")
                .attr("x", -50)
                .attr("y", -30)
                .attr("width", 100)
                .attr("height", 60)
                .attr("fill", provider.color)
                .attr("fill-opacity", 0.1)
                .attr("stroke", provider.color)
                .attr("stroke-width", 2)
                .attr("rx", 8);

            providerGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("y", 5)
                .attr("fill", provider.color)
                .style("font-size", "14px")
                .style("font-weight", "600")
                .text(provider.name);

            // Status indicator
            providerGroup.append("circle")
                .attr("class", `status-${provider.id}`)
                .attr("cx", 35)
                .attr("cy", -15)
                .attr("r", 5)
                .attr("fill", "#10b981");
        });

        // Cost comparison box
        const costGroup = svg.append("g")
            .attr("transform", "translate(450, 450)");

        costGroup.append("rect")
            .attr("x", -120)
            .attr("y", -30)
            .attr("width", 240)
            .attr("height", 60)
            .attr("fill", "#ecfdf5")
            .attr("stroke", "#10b981")
            .attr("stroke-width", 2)
            .attr("rx", 8);

        costGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -5)
            .attr("fill", "#064e3b")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Cost Savings");

        costGroup.append("text")
            .attr("x", -50)
            .attr("y", 20)
            .attr("fill", "#dc2626")
            .style("font-size", "16px")
            .style("text-decoration", "line-through")
            .text("$39");

        costGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("fill", "#059669")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text("$4");

        costGroup.append("text")
            .attr("x", 35)
            .attr("y", 20)
            .attr("fill", "#064e3b")
            .style("font-size", "12px")
            .text("(90% less!)");

    }, []);

    // Animate query flow
    const animateQuery = (queryText) => {
        const svg = d3.select(svgRef.current);
        const queryId = Date.now();

        // Create query packet
        const queryPacket = svg.append("g")
            .attr("class", `query-${queryId}`)
            .attr("transform", "translate(100, 250)");

        queryPacket.append("rect")
            .attr("x", -40)
            .attr("y", -15)
            .attr("width", 80)
            .attr("height", 30)
            .attr("fill", "#3b82f6")
            .attr("rx", 15)
            .attr("opacity", 0.8);

        queryPacket.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 5)
            .attr("fill", "#ffffff")
            .style("font-size", "11px")
            .text("Query");

        // Animate to gateway
        queryPacket.transition()
            .duration(1000)
            .attr("transform", "translate(450, 250)")
            .on("end", function () {
                // Simulate provider selection with occasional failures
                const shouldFail = Math.random() < 0.3;
                const providerIndex = Math.floor(Math.random() * providers.length);
                const selectedProvider = providers[providerIndex];

                if (shouldFail) {
                    // Show failure
                    showFailure(queryId, selectedProvider, queryText);
                } else {
                    // Direct success
                    routeToProvider(queryId, selectedProvider, queryText);
                }
            });
    };

    const showFailure = (queryId, failedProvider, queryText) => {
        const svg = d3.select(svgRef.current);

        // Mark provider as failed
        svg.select(`.status-${failedProvider.id}`)
            .attr("fill", "#ef4444");

        // Show X mark
        const failMark = svg.append("text")
            .attr("x", failedProvider.x)
            .attr("y", failedProvider.y)
            .attr("text-anchor", "middle")
            .attr("fill", "#ef4444")
            .style("font-size", "40px")
            .style("font-weight", "bold")
            .text("✗")
            .attr("opacity", 0);

        failMark.transition()
            .duration(300)
            .attr("opacity", 1)
            .transition()
            .delay(500)
            .duration(300)
            .attr("opacity", 0)
            .remove();

        // Auto-retry with different provider
        setTimeout(() => {
            svg.select(`.status-${failedProvider.id}`)
                .attr("fill", "#10b981");

            const otherProviders = providers.filter(p => p.id !== failedProvider.id);
            const newProvider = otherProviders[Math.floor(Math.random() * otherProviders.length)];

            // Show retry notification
            const retryNotif = svg.append("g")
                .attr("transform", "translate(450, 250)");

            retryNotif.append("rect")
                .attr("x", -60)
                .attr("y", 70)
                .attr("width", 120)
                .attr("height", 25)
                .attr("fill", "#fbbf24")
                .attr("rx", 12);

            retryNotif.append("text")
                .attr("text-anchor", "middle")
                .attr("y", 87)
                .attr("fill", "#78350f")
                .style("font-size", "12px")
                .style("font-weight", "500")
                .text("Auto-retry");

            retryNotif.transition()
                .duration(1000)
                .attr("opacity", 0)
                .remove();

            routeToProvider(queryId, newProvider, queryText);
        }, 1000);
    };

    const routeToProvider = (queryId, provider, queryText) => {
        const svg = d3.select(svgRef.current);
        const queryPacket = svg.select(`.query-${queryId}`);

        // Highlight connection
        svg.select(`.gateway-to-${provider.id}`)
            .attr("stroke", provider.color)
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "0");

        // Move to provider
        queryPacket.transition()
            .duration(800)
            .attr("transform", `translate(${provider.x}, ${provider.y})`)
            .on("end", function () {
                // Transform to response
                d3.select(this).select("rect")
                    .attr("fill", provider.color);

                d3.select(this).select("text")
                    .text("Response");

                // Move back to gateway
                d3.select(this).transition()
                    .delay(500)
                    .duration(800)
                    .attr("transform", "translate(450, 250)")
                    .on("end", function () {
                        // Move to user
                        d3.select(this).transition()
                            .duration(1000)
                            .attr("transform", "translate(100, 250)")
                            .on("end", function () {
                                d3.select(this).remove();

                                // Reset connection
                                svg.select(`.gateway-to-${provider.id}`)
                                    .attr("stroke", "#64748b")
                                    .attr("stroke-width", 2)
                                    .attr("stroke-dasharray", "5,5");

                                // Update stats
                                setQueryCount(prev => prev + 1);
                                setTotalSaved(prev => prev + 35);
                            });
                    });
            });
    };

    const sendQuery = () => {
        const queryText = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
        animateQuery(queryText);

        setQueries(prev => [...prev.slice(-4), {
            id: Date.now(),
            text: queryText,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    useEffect(() => {
        const interval = setInterval(sendQuery, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Martian Gateway: Intelligent LLM Router</h1>
                    <p className="text-gray-600 mb-6">Watch how queries flow through our unified interface with automatic failover and 90% cost reduction</p>

                    <div className="flex gap-6 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 flex-1">
                            <h3 className="font-semibold text-blue-800 mb-1">Queries Processed</h3>
                            <p className="text-2xl font-bold text-blue-600">{queryCount}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 flex-1">
                            <h3 className="font-semibold text-green-800 mb-1">Total Saved</h3>
                            <p className="text-2xl font-bold text-green-600">${totalSaved}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 flex-1">
                            <h3 className="font-semibold text-purple-800 mb-1">Reliability</h3>
                            <p className="text-2xl font-bold text-purple-600">99.9%</p>
                        </div>
                    </div>

                    <svg ref={svgRef} width="900" height="500" className="border border-gray-200 rounded-lg bg-gray-50"></svg>

                    <div className="mt-6">
                        <h3 className="font-semibold text-gray-800 mb-3">Recent Queries</h3>
                        <div className="space-y-2">
                            {queries.map(query => (
                                <div key={query.id} className="bg-gray-50 rounded p-3 flex justify-between items-center">
                                    <span className="text-gray-700">{query.text}</span>
                                    <span className="text-gray-500 text-sm">{query.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-800 mb-2">🔄 Auto-Retry</h4>
                            <p className="text-sm text-yellow-700">Failed requests automatically reroute to healthy providers</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-800 mb-2">🎯 Unified Interface</h4>
                            <p className="text-sm text-blue-700">Single API endpoint for all LLM providers</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-800 mb-2">💰 Cost Optimization</h4>
                            <p className="text-sm text-green-700">Intelligent routing reduces costs by 90%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MGatewayOne;
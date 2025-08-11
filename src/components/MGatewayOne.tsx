import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Provider {
    id: string;
    name: string;
    x: number;
    y: number;
    status: string;
    color: string;
}

interface Query {
    id: number;
    text: string;
    timestamp: string;
}

const MGatewayOne = () => {
    const svgGatewayOneRef = useRef(null);
    const [queries, setQueries] = useState([] as Query[]);
    const [totalSaved, setTotalSaved] = useState(0);
    const [queryCount, setQueryCount] = useState(0);

    const providers: Provider[] = [
        { id: 'chatgpt', name: 'ChatGPT', x: 1100, y: 100, status: 'active', color: '#236554' },
        { id: 'claude', name: 'Claude', x: 1100, y: 250, status: 'active', color: '#FF7D68' },
        { id: 'llama', name: 'Llama 8B', x: 1100, y: 400, status: 'active', color: '#A73F2E' }
    ];

    const sampleQueries: string[] = [
        "What is the world position right now?",
        "Explain quantum computing simply",
        "How do I train a neural network?",
        "What's the weather forecast?",
        "Translate this to Spanish",
        "Debug my Python code"
    ];

    useEffect(() => {
        const svg = d3.select(svgGatewayOneRef.current);
        const width = 1200;
        const height = 600;

        svg.attr('viewBox', `0 0 ${width} ${height}`);

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
            .attr("x1", 220)
            .attr("y1", 250)
            .attr("x2", 320)
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
            .attr("transform", "translate(135, 250)");

        userGroup.append("circle")
            .attr("r", 80)
            .attr("fill", "#FF563F")
            .attr("stroke", "#ffbfc2")
            .attr("stroke-width", 2);

        userGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 5)
            .attr("fill", "#fff")
            .style("font-size", "1.4em")
            .style("font-weight", "500")
            .text("User");

        // Draw Gateway
        const gatewayGroup = svg.append("g")
            .attr("transform", "translate(460, 250)");

        gatewayGroup.append("circle")
            .attr("r", 140)
            .attr("fill", "#0C0C0C")
            .attr("stroke", "#928E8B")
            .attr("stroke-width", 3)
            .attr("rx", 10);

        gatewayGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -20)
            .attr("fill", "#f8fafc")
            .style("font-size", "1.4em")
            .style("font-weight", "bold")
            .text("Martian Gateway");

        gatewayGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 5)
            .attr("fill", "#94a3b8")
            .style("font-size", "1.1em")
            .text("Intelligent Router");

        // Reliability indicator
        gatewayGroup.append("circle")
            .attr("cx", -70)
            .attr("cy", 30)
            .attr("r", 8)
            .attr("fill", "#10b981");

        gatewayGroup.append("text")
            .attr("x", -55)
            .attr("y", 35)
            .attr("fill", "#94a3b8")
            .style("font-size", "1em")
            .text("99.9% Uptime");

        // Draw Providers
        providers.forEach(provider => {
            const providerGroup = svg.append("g")
                .attr("class", `provider-${provider.id}`)
                .attr("transform", `translate(${provider.x}, ${provider.y})`);

            providerGroup.append("circle")
                .attr("r", 65)
                .attr("width", 100)
                .attr("height", 60)
                .attr("fill", provider.color)
                .attr("fill-opacity", 0.5)
                .attr("stroke", provider.color)
                .attr("stroke-width", 2)
                .attr("rx", 8);

            providerGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("y", 5)
                .attr("fill", "#fff")
                .style("font-size", "1em")
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
            .style("font-size", "1.2em")
            .style("font-weight", "bold")
            .text("Cost Savings");

        costGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 20)
            .attr("fill", "#059669")
            .style("font-size", "1em")
            .style("font-weight", "bold")
            .text("20%");

    }, []);

    // Animate query flow
    const animateQuery = (queryText) => {
        const svg = d3.select(svgGatewayOneRef.current);
        const queryId = Date.now();

        // Create query packet
        const queryPacket = svg.append("g")
            .attr("class", `query-${queryId}`)
            .attr("transform", "translate(135, 250)");

        queryPacket.append("rect")
            .attr("x", -60)
            .attr("y", -15)
            .attr("width", 120)
            .attr("height", 30)
            .attr("fill", "#3b82f6")
            .attr("rx", 15)
            .attr("opacity", 0.8);

        queryPacket.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 5)
            .attr("fill", "#ffffff")
            .style("font-size", ".875em")
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
        const svg = d3.select(svgGatewayOneRef.current);

        // Mark provider as failed
        svg.select(`.status-${failedProvider.id}`)
            .attr("fill", "#f59e0b");

        // Triangle alert icon near failure
        const alertIconGroup = svg.append("g")
            .attr("transform", `translate(${failedProvider.x + 28}, ${failedProvider.y - 28})`)
            .attr("opacity", 0);

        alertIconGroup.append("polygon")
            .attr("points", "0,-12 10,8 -10,8")
            .attr("fill", "#f59e0b")
            .attr("stroke", "#b45309")
            .attr("stroke-width", 2)
            .attr("rx", 2);

        alertIconGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 5)
            .attr("fill", "#111827")
            .style("font-size", "1em")
            .style("font-weight", "bold")
            .text("!");

        alertIconGroup.transition()
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
                .style("font-size", "1em")
                .style("font-weight", "500")
                .text("⚠ Auto-retry");

            retryNotif.transition()
                .duration(1000)
                .attr("opacity", 0)
                .remove();

            routeToProvider(queryId, newProvider, queryText);
        }, 1000);
    };

    const routeToProvider = (queryId, provider, queryText) => {
        const svg = d3.select(svgGatewayOneRef.current);
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
                                setTotalSaved(prev => prev + 0.02);
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
        const interval = setInterval(sendQuery, 7000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Martian Gateway: Intelligent LLM Router</h1>
                <p className="text-gray-600 mb-6">Watch how queries flow through our unified interface with automatic failover and 90% cost reduction</p>
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
                    <div className="">
                        <div className="flex gap-6 mb-6">
                            <div className="bg-mt-red shadow rounded-lg p-4 flex-1 ">
                                <h3 className="font-semibold mb-1">Queries Processed</h3>
                                <p className="text-2xl font-bold text-white">{queryCount}</p>
                            </div>
                            <div className="bg-mt-green shadow rounded-lg p-4 flex-1">
                                <h3 className="font-semibold mb-1">Total Saved</h3>
                                <p className="text-2xl font-bold text-white">${totalSaved.toFixed(2)}</p>
                            </div>
                            <div className="bg-mt-yellow shadow rounded-lg p-4 flex-1">
                                <h3 className="font-semibold mb-1">Reliability</h3>
                                <p className="text-2xl font-bold text-white">99.9%</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <svg ref={svgGatewayOneRef}></svg>
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="bg-mt-red shadow rounded-lg p-4">
                                <h4 className="font-semibold mb-2">🔄 Auto-Retry</h4>
                                <p className="text-sm text-white">Failed requests automatically reroute to healthy providers</p>
                            </div>
                            <div className="bg-mt-green shadow rounded-lg p-4">
                                <h4 className="font-semibold mb-2">🎯 Unified Interface</h4>
                                <p className="text-sm text-white">Single API endpoint for all LLM providers</p>
                            </div>
                            <div className="bg-mt-yellow shadow rounded-lg p-4">
                                <h4 className="font-semibold mb-2">💰 Unified Billing</h4>
                                <p className="text-sm text-white">One payment method for all providers. Pay-as-you-go across OpenAI, Anthropic, Google, and more - all on a single invoice.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MGatewayOne;
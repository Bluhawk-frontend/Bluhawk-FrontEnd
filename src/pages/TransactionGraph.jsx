import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';

const TransactionGraph = ({ targetAddress, transactionAddresses }) => {
  const networkRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [usedAddresses, setUsedAddresses] = useState(new Set(transactionAddresses));

  useEffect(() => {
    if (!targetAddress || !transactionAddresses.length) return;

    // Initialize with the initial target and its transactions if nodes are empty
    if (nodes.length === 0) {
      const addressCounts = transactionAddresses.reduce((acc, addr) => {
        acc[addr] = (acc[addr] || 0) + 1;
        return acc;
      }, {});

      const initialNodes = [
        {
          id: targetAddress,
          label: `Target\n${targetAddress.slice(0, 8)}...`,
          shape: 'dot',
          size: 30,
          font: { color: '#ffffff', size: 16, face: 'arial' },
          color: { background: '#ff4d4f', border: '#ff7875' },
        },
        ...Object.keys(addressCounts).map((addr, i) => ({
          id: addr,
          label: `${addr.slice(0, 8)}...\nTx: ${addressCounts[addr]}`,
          shape: 'dot',
          size: 30,
          font: { color: '#ffffff', size: 12, face: 'arial' },
          color: { background: '#1890ff', border: '#40a9ff' },
        })),
      ];

      const initialEdges = Object.keys(addressCounts).map((addr) => ({
        from: targetAddress,
        to: addr,
        label: `Tx: ${addressCounts[addr]}`,
        font: {
          align: 'top',
          color: '#cccccc',
          size: 10,
          face: 'arial',
          strokeWidth: 0,
          strokeColor: 'transparent',
        },
        color: { color: '#1890ff' },
        arrows: 'to',
        width: Math.min(addressCounts[addr] * 1.5, 5),
      }));

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [targetAddress, transactionAddresses, nodes.length]);

  useEffect(() => {
    const container = networkRef.current;
    if (!container || nodes.length === 0) return;

    // Set network options
    const options = {
      physics: {
        enabled: true,
        stabilization: {
          iterations: 1000,
          updateInterval: 25,
        },
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.005,
          springLength: 200,
          springConstant: 0.05,
        },
      },
      nodes: {
        shape: 'dot',
        scaling: {
          min: 10,
          max: 30,
        },
      },
      edges: {
        smooth: {
          type: 'dynamic',
        },
      },
      interaction: {
        hover: true,
        selectConnectedEdges: false,
      },
      layout: {
        improvedLayout: true,
      },
    };

    const network = new Network(container, { nodes, edges }, options);

    // Handle node click
    network.on('click', async (params) => {
      if (params.nodes.length > 0) {
        const clickedNodeId = params.nodes[0];
        // Check if the node is already a target (has outgoing edges)
        const isAlreadyTarget = edges.some((edge) => edge.from === clickedNodeId);
        if (!isAlreadyTarget) {
          try {
            // Fetch new transactions for the clicked node
            const url = `${
              import.meta.env.VITE_API_BASE_URL
            }/crypto/wallet_history/?address=${clickedNodeId}&page_size=30`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.status === 200 && data?.message === 'success') {
              const newTransactionAddresses = (data.data.result || [])
                .flatMap((tx) => [tx.from_address, tx.to_address])
                .filter((addr) => addr && addr !== clickedNodeId && !usedAddresses.has(addr));

              // Update used addresses
              newTransactionAddresses.forEach((addr) => usedAddresses.add(addr));

              const addressCounts = newTransactionAddresses.reduce((acc, addr) => {
                acc[addr] = (acc[addr] || 0) + 1;
                return acc;
              }, {});

              // Update the clicked node to be a target
              const updatedNodes = nodes.map((node) =>
                node.id === clickedNodeId
                  ? {
                      ...node,
                      label: `Target\n${clickedNodeId.slice(0, 8)}...`,
                      size: 30,
                      color: { background: '#ff4d4f', border: '#ff7875' },
                    }
                  : node
              );

              // Add new nodes if they don't already exist
              const newNodes = Object.keys(addressCounts)
                .filter((addr) => !nodes.some((node) => node.id === addr))
                .map((addr, i) => ({
                  id: addr,
                  label: `${addr.slice(0, 8)}...\nTx: ${addressCounts[addr]}`,
                  shape: 'dot',
                  size: 30,
                  font: { color: '#ffffff', size: 12, face: 'arial' },
                  color: { background: '#1890ff', border: '#40a9ff' },
                }));

              // Add new edges
              const newEdges = Object.keys(addressCounts).map((addr) => ({
                from: clickedNodeId,
                to: addr,
                label: `Tx: ${addressCounts[addr]}`,
                font: {
                  align: 'top',
                  color: '#cccccc',
                  size: 10,
                  face: 'arial',
                  strokeWidth: 0,
                  strokeColor: 'transparent',
                },
                color: { color: '#1890ff' },
                arrows: 'to',
                width: Math.min(addressCounts[addr] * 1.5, 5),
              }));

              // Update state with new nodes, edges, and used addresses
              setNodes([...updatedNodes, ...newNodes]);
              setEdges([...edges, ...newEdges]);
              setUsedAddresses(new Set(usedAddresses));
            }
          } catch (error) {
            console.error('Error fetching transactions:', error);
          }
        }
      }
    });

    return () => {
      network.destroy();
    };
  }, [nodes, edges, usedAddresses]);

  if (!nodes.length) {
    return <p className="text-gray-400 text-center">No transactions to display.</p>;
  }

  return (
    <div className="w-full h-[600px] bg-[#1a1f37] rounded-xl shadow-xl p-2">
      <div ref={networkRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default TransactionGraph;
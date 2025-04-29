import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component for capabilities with C4-style boxes
const CapabilityNode = ({ data }: { data: any }) => {
  // Define domain colors
  const domainColors = {
    'mobile-application': '#fffae6',
    'payments': '#e6f7ff',
    'customer': '#f6ffed',
    'security': '#fff2e8',
    'infrastructure': '#f9f0ff'
  };

  // Define type styles for C4-like appearance with better contrast
  const typeStyles = {
    'pillar': {
      backgroundColor: '#ffffff',
      borderColor: '#08427b',
      headerColor: '#ffffff',
      headerBg: '#1a67a3', // Lighter blue for better contrast
      boxShadow: '0 4px 8px rgba(8, 66, 123, 0.2)'
    },
    'functionality': {
      backgroundColor: '#ffffff',
      borderColor: '#438dd5',
      headerColor: '#ffffff',
      headerBg: '#438dd5',
      boxShadow: '0 4px 8px rgba(67, 141, 213, 0.2)'
    }
  };

  // Define status colors
  const statusColors = {
    'active': '#52c41a',
    'planned': '#1890ff',
    'deprecated': '#faad14',
    'inactive': '#f5222d'
  };

  // Get the style based on type
  const typeStyle = typeStyles[data.type] || typeStyles.functionality;
  
  return (
    <div className="capability-node" style={{ 
      width: '280px',
      borderRadius: '4px',
      border: `2px solid ${typeStyle.borderColor}`,
      overflow: 'hidden',
      boxShadow: typeStyle.boxShadow,
      transition: 'all 0.3s ease',
      backgroundColor: typeStyle.backgroundColor
    }}>
      {/* C4-style header */}
      <div style={{ 
        backgroundColor: typeStyle.headerBg,
        color: typeStyle.headerColor,
        padding: '10px 15px',
        fontWeight: 'bold',
        fontSize: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{data.title}</span>
        <span style={{ 
          fontSize: '11px', 
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: '2px 6px',
          borderRadius: '4px',
          textTransform: 'uppercase'
        }}>
          {data.type}
        </span>
      </div>
      
      {/* Content area */}
      <div style={{ padding: '15px' }}>
        <div style={{ 
          fontSize: '13px', 
          marginBottom: '12px',
          color: '#595959',
          lineHeight: '1.5'
        }}>
          {data.description}
        </div>
        
        {/* Domain badge */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ 
            fontSize: '12px',
            color: '#8c8c8c',
            marginRight: '8px'
          }}>Domain:</span>
          <span style={{ 
            fontSize: '12px',
            backgroundColor: domainColors[data.domain] || '#f0f2f5',
            border: '1px solid #d9d9d9',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {data.domain}
          </span>
        </div>
        
        {/* Status and criticality */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '12px',
          marginTop: '10px'
        }}>
          <div>
            <span style={{ color: '#8c8c8c', marginRight: '4px' }}>Status:</span>
            <span style={{ 
              backgroundColor: statusColors[data.status] || '#8c8c8c',
              padding: '2px 6px',
              borderRadius: '4px',
              color: 'white',
              fontWeight: '500'
            }}>
              {data.status}
            </span>
          </div>
          {data.criticality && (
            <div>
              <span style={{ color: '#8c8c8c', marginRight: '4px' }}>Criticality:</span>
              <span style={{ 
                backgroundColor: data.criticality === 'high' ? '#ff4d4f' : 
                                data.criticality === 'medium' ? '#faad14' : '#52c41a',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'white',
                fontWeight: '500'
              }}>
                {data.criticality}
              </span>
            </div>
          )}
        </div>
        
        {/* Owner information */}
        {data.owner && (
          <div style={{ 
            fontSize: '12px', 
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ color: '#8c8c8c', marginRight: '8px' }}>Owner:</span>
            <span style={{ fontWeight: '500' }}>{data.owner}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Define node types
const nodeTypes: NodeTypes = {
  capability: CapabilityNode,
};

// Main component
const BlueprintVisualization: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [domains, setDomains] = useState<string[]>([]);

  // Handle domain filter change
  const handleDomainChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(event.target.value);
  }, []);

  // Load blueprint data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load the actual blueprint data from the JSON file
        // Use a path that works with the baseUrl
        const response = await fetch('/enterprise-app-architecture-blueprint/blueprint-data.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch blueprint data: ${response.status}`);
        }
        const blueprintData = await response.json();

        // Extract unique domains
        const uniqueDomains = [...new Set(blueprintData.capabilities.map((cap: any) => cap.domain))] as string[];
        setDomains(uniqueDomains);

        // Transform data to React Flow format
        const flowNodes = blueprintData.capabilities.map((capability: any) => ({
          id: capability.id,
          type: 'capability',
          position: capability.position,
          data: capability,
        }));

        // Create edges with different styles based on type - C4-style relationships
        let flowEdges = blueprintData.relationships.map((rel: any) => {
          // Define colors and styles for different relationship types in C4 style
          const relationshipStyles: Record<string, any> = {
            'parent-pillar': {
              stroke: '#08427b',  // Dark blue for containment
              strokeWidth: 3,
              animated: false,
              style: 'smoothstep',
              markerEnd: { type: 'arrowclosed', color: '#08427b' },
              strokeDasharray: '0',  // Solid line for containment
              label: 'Contains',
              labelBgStyle: { fill: '#e6f7ff', stroke: '#08427b' }
            },
            'related-pillar': {
              stroke: '#6b6b6b',  // Gray for structural relationships
              strokeWidth: 2,
              animated: false,
              style: 'straight',
              markerEnd: { type: 'arrow', color: '#6b6b6b' },
              strokeDasharray: '5,5',  // Dashed line for relationships
              label: 'Related to',
              labelBgStyle: { fill: '#f5f5f5', stroke: '#d9d9d9' }
            },
            'related-functionality': {
              stroke: '#6b6b6b',  // Gray for structural relationships
              strokeWidth: 2,
              animated: false,
              style: 'step',
              markerEnd: { type: 'arrow', color: '#6b6b6b' },
              strokeDasharray: '5,5',  // Dashed line for relationships
              label: 'Related to',
              labelBgStyle: { fill: '#f5f5f5', stroke: '#d9d9d9' }
            },
            'depends-on': {
              stroke: '#b02020',  // Red for dependencies
              strokeWidth: 2,
              animated: false,
              style: 'bezier',
              markerEnd: { type: 'arrowclosed', color: '#b02020' },
              strokeDasharray: '0',  // Solid line for dependencies
              label: 'Depends on',
              labelBgStyle: { fill: '#fff1f0', stroke: '#ffa39e' }
            },
            'produces-events': {
              stroke: '#50b83c',  // Green for events
              strokeWidth: 2,
              animated: true,
              style: 'smoothstep',
              markerEnd: { type: 'arrow', color: '#50b83c' },
              strokeDasharray: '1,3',  // Dotted line for events
              label: 'Produces events for',
              labelBgStyle: { fill: '#f6ffed', stroke: '#b7eb8f' }
            }
          };
          
          const style = relationshipStyles[rel.type] || relationshipStyles['related-functionality'];
          
          return {
            id: `${rel.source}-${rel.target}`,
            source: rel.source,
            target: rel.target,
            type: style.style,
            animated: style.animated,
            style: { 
              stroke: style.stroke,
              strokeWidth: style.strokeWidth,
              strokeDasharray: style.strokeDasharray
            },
            markerEnd: style.markerEnd,
            label: style.label || rel.type.replace(/-/g, ' '),
            labelStyle: { 
              fill: '#333', 
              fontSize: 11, 
              fontWeight: 500,
              fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif'
            },
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 4,
            labelBgStyle: style.labelBgStyle || { fill: '#f9f9f9', fillOpacity: 0.8, stroke: '#e8e8e8' }
          };
        });

        // Add parent-child connections between functionalities and their parent pillars
        const parentChildEdges = [];
        
        // Loop through all capabilities to find functionalities
        for (const capability of blueprintData.capabilities) {
          if (capability.type === 'functionality' && capability.dependencies) {
            // Find parent pillar relationship
            const parentPillarRel = capability.dependencies.find(dep => dep.type === 'parent-pillar');
            if (parentPillarRel) {
              // Create a connection line from functionality to parent pillar
              parentChildEdges.push({
                id: `${capability.id}-to-${parentPillarRel.id}`,
                source: capability.id,
                target: parentPillarRel.id,
                type: 'smoothstep',
                animated: false,
                style: { 
                  stroke: '#08427b',  // Dark blue for containment
                  strokeWidth: 2,
                  strokeDasharray: '0',  // Solid line for containment
                },
                markerEnd: { type: 'arrowclosed', color: '#08427b' },
                label: 'Part of',
                labelStyle: { 
                  fill: '#333', 
                  fontSize: 11, 
                  fontWeight: 500,
                  fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif'
                },
                labelBgPadding: [8, 4],
                labelBgBorderRadius: 4,
                labelBgStyle: { fill: '#f9f9f9', fillOpacity: 0.8, stroke: '#e8e8e8' }
              });
            }
          }
        }
        
        // Combine the relationship edges with the parent-child edges
        flowEdges = [...flowEdges, ...parentChildEdges];
        
        setNodes(flowNodes);
        setEdges(flowEdges);
        setLoading(false);
      } catch (error) {
        console.error('Error loading blueprint data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter nodes based on selected domain
  useEffect(() => {
    if (loading) return;
    
    const filteredNodes = nodes.filter(node => 
      selectedDomain === 'all' || node.data.domain === selectedDomain
    );
    
    // Only show edges where both source and target nodes are visible
    const visibleNodeIds = new Set(filteredNodes.map(node => node.id));
    
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        hidden: !(selectedDomain === 'all' || node.data.domain === selectedDomain)
      }))
    );
    
    setEdges(prevEdges => 
      prevEdges.map(edge => ({
        ...edge,
        hidden: !visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)
      }))
    );
  }, [selectedDomain, loading]); // Remove nodes and edges from dependencies

  // Define the relationship legend items with C4-style line patterns
  const relationshipLegend = [
    { 
      type: 'part-of', 
      color: '#08427b', 
      label: 'Part Of', 
      description: 'Functionality is part of a parent pillar',
      pattern: '0',  // Solid line
      bgColor: '#e6f7ff'
    },
    { 
      type: 'parent-pillar', 
      color: '#08427b', 
      label: 'Contains', 
      description: 'Parent pillar contains this sub-capability',
      pattern: '0',  // Solid line
      bgColor: '#e6f7ff'
    },
    { 
      type: 'related-pillar', 
      color: '#6b6b6b', 
      label: 'Related To', 
      description: 'Pillars that work together',
      pattern: '5,5',  // Dashed line
      bgColor: '#f5f5f5'
    },
    { 
      type: 'related-functionality', 
      color: '#6b6b6b', 
      label: 'Related To', 
      description: 'Functionalities that work together',
      pattern: '5,5',  // Dashed line
      bgColor: '#f5f5f5'
    },
    { 
      type: 'depends-on', 
      color: '#b02020', 
      label: 'Depends On', 
      description: 'Capability depends on another',
      pattern: '0',  // Solid line
      bgColor: '#fff1f0'
    },
    { 
      type: 'produces-events', 
      color: '#50b83c', 
      label: 'Produces Events For', 
      description: 'Capability produces events for another',
      pattern: '1,3',  // Dotted line
      bgColor: '#f6ffed'
    }
  ];

  return (
    <div style={{ height: '800px', width: '100%' }}>
      {loading ? (
        <div>Loading blueprint data...</div>
      ) : (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <label htmlFor="domain-filter" style={{ marginRight: '10px', fontWeight: 500 }}>Filter by Domain:</label>
              <select 
                id="domain-filter" 
                value={selectedDomain} 
                onChange={handleDomainChange}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
              >
                <option value="all">All Domains</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              backgroundColor: '#f9f9f9', 
              padding: '12px', 
              borderRadius: '8px',
              border: '1px solid #e8e8e8',
              maxWidth: '400px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Relationship Types</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {relationshipLegend.map((item) => (
                  <div key={item.type} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: '12px',
                    backgroundColor: item.bgColor,
                    padding: '8px 10px',
                    borderRadius: '4px',
                    border: `1px solid ${item.color}`
                  }}>
                    <div style={{ 
                      width: '40px', 
                      height: '3px',
                      backgroundColor: item.color,
                      marginRight: '10px',
                      strokeDasharray: item.pattern,
                      borderStyle: item.pattern === '5,5' ? 'dashed' : 
                                  item.pattern === '1,3' ? 'dotted' : 'solid',
                      borderWidth: '2px 0 0 0',
                      borderColor: item.color
                    }} />
                    <span style={{ fontWeight: 600, marginRight: '6px', color: item.color }}>{item.label}:</span>
                    <span style={{ color: '#595959' }}>{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ 
            width: '100%', 
            height: '600px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            marginBottom: '40px' // Add margin to separate from content below
          }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2} // Allow zooming out more
              maxZoom={1.5} // Limit maximum zoom
              defaultViewport={{ x: 0, y: 0, zoom: 0.6 }} // Start more zoomed out
              fitViewOptions={{ padding: 0.3 }} // Add padding around the view
              attributionPosition="bottom-left"
              connectionLineType={ConnectionLineType.SmoothStep}
            >
              <Controls showInteractive={true} />
              <MiniMap nodeStrokeWidth={3} zoomable pannable />
              <Background color="#f5f5f5" gap={20} size={1} />
            </ReactFlow>
          </div>
        </>
      )}
    </div>
  );
};

export default BlueprintVisualization;

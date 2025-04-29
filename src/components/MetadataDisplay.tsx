import React from 'react';
import styles from './MetadataDisplay.module.css';

interface MetadataProps {
  metadata: {
    id: string;
    title: string;
    description?: string;
    type: string;
    domain?: string;
    owner?: string;
    status?: string;
    phase?: string;
    criticality?: string;
    dependencies?: Array<{
      id: string;
      type: string;
    }>;
  };
}

const MetadataDisplay: React.FC<MetadataProps> = ({ metadata }) => {
  // Define status colors
  const statusColors = {
    active: '#52c41a',
    planned: '#1890ff',
    deprecated: '#faad14',
    inactive: '#f5222d',
  };

  // Define criticality colors
  const criticalityColors = {
    high: '#f5222d',
    medium: '#faad14',
    low: '#52c41a',
  };

  // Define relationship type labels
  const relationshipLabels = {
    'parent-pillar': 'Parent Pillar',
    'related-pillar': 'Related Pillar',
    'related-functionality': 'Related Functionality',
    'depends-on': 'Depends On',
    'produces-events': 'Produces Events For',
  };

  return (
    <div className={styles.metadataContainer}>
      <div className={styles.metadataGrid}>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>ID:</span>
          <span className={styles.metadataValue}>{metadata.id}</span>
        </div>
        
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Type:</span>
          <span className={styles.metadataValue}>
            <span className={styles.badge} style={{ 
              backgroundColor: metadata.type === 'pillar' ? '#722ed1' : '#1890ff' 
            }}>
              {metadata.type.charAt(0).toUpperCase() + metadata.type.slice(1)}
            </span>
          </span>
        </div>
        
        {metadata.domain && (
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Domain:</span>
            <span className={styles.metadataValue}>{metadata.domain}</span>
          </div>
        )}
        
        {metadata.owner && (
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Owner:</span>
            <span className={styles.metadataValue}>{metadata.owner}</span>
          </div>
        )}
        
        {metadata.status && (
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Status:</span>
            <span className={styles.metadataValue}>
              <span className={styles.badge} style={{ 
                backgroundColor: statusColors[metadata.status] || '#8c8c8c' 
              }}>
                {metadata.status.charAt(0).toUpperCase() + metadata.status.slice(1)}
              </span>
            </span>
          </div>
        )}
        
        {metadata.phase && (
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Phase:</span>
            <span className={styles.metadataValue}>{metadata.phase}</span>
          </div>
        )}
        
        {metadata.criticality && (
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Criticality:</span>
            <span className={styles.metadataValue}>
              <span className={styles.badge} style={{ 
                backgroundColor: criticalityColors[metadata.criticality] || '#8c8c8c' 
              }}>
                {metadata.criticality.charAt(0).toUpperCase() + metadata.criticality.slice(1)}
              </span>
            </span>
          </div>
        )}
      </div>
      
      {metadata.dependencies && metadata.dependencies.length > 0 && (
        <div className={styles.relationshipsSection}>
          <h3>Relationships</h3>
          <ul className={styles.relationshipsList}>
            {metadata.dependencies.map((dep, index) => (
              <li key={index} className={styles.relationshipItem}>
                <span className={styles.relationshipType} style={{
                  backgroundColor: dep.type === 'parent-pillar' ? '#1890ff' : 
                                  dep.type === 'related-pillar' ? '#722ed1' : 
                                  dep.type === 'related-functionality' ? '#fa8c16' :
                                  dep.type === 'depends-on' ? '#ff4d4f' : '#52c41a'
                }}>
                  {relationshipLabels[dep.type] || dep.type}
                </span>
                <span className={styles.relationshipTarget}>{dep.id}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MetadataDisplay;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from '../../components/Common/Loading';

const SimpleWitnessList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [witnessData, setWitnessData] = useState([]);

  useEffect(() => {
    const fetchWitnessData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('https://steemyy.com/api/steemit/ranking/', {
          timeout: 10000
        });
        if (response.data && Array.isArray(response.data)) {
          setWitnessData(response.data.slice(0, 50)); // Show only first 50
        } else {
          throw new Error('Invalid response format');
        }

      } catch (error) {
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWitnessData();
  }, []);
  // Add debug info at the top
  const debugInfo = (
    <div style={{
      padding: '10px',
      backgroundColor: '#f0f0f0',
      margin: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace'
    }}>
      <h3>Debug Info:</h3>
      <p>Loading: {loading.toString()}</p>
      <p>Error: {error || 'null'}</p>
      <p>Data Count: {witnessData.length}</p>
      <p>Current Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        {debugInfo}
        <Loading message="Loading Simple Witness Data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        {debugInfo}
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }
  return (
    <div className="dashboard-container">
      {debugInfo}
      <h1>Simple Witness List ({witnessData.length} witnesses)</h1>
      <div>
        {witnessData.map((witness, index) => (
          <div key={index} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
            <strong>#{index + 1} {witness.owner}</strong>
            <div>Votes: {witness.approval || 0}</div>
            <div>Status: {witness.current ? 'Active' : 'Standby'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleWitnessList;
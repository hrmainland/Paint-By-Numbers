import { useState, useEffect } from 'react'
import { serverTest, dbTest } from '../utils/backendCalls'

function App() {
  const [serverData, setServerData] = useState(null);
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const serverResponse = await serverTest();
        setServerData(serverResponse);
        
        const dbResponse = await dbTest();
        setDbData(dbResponse || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [])

  return (
    <>
      <h1>Welcome to your app</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Server Response:</h2>
          <p>{serverData}</p>
          
          <h2>Database Data:</h2>
          {dbData.length === 0 ? (
            <p>No data found. Make sure you have a 'todos' table with some data.</p>
          ) : (
            <ul>
              {dbData.map((item, index) => (
                <li key={item.id || index}>
                  {JSON.stringify(item)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  )
}

export default App

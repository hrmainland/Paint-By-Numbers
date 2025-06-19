import { useState } from 'react'
import { editImage } from '../utils/backendCalls'

function App() {
  const [editedImage, setEditedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [prompt, setPrompt] = useState("Turn the cat into a dog")

  const handleEditImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const imageUrl = `${window.location.origin}/cat.png`
      
      const result = await editImage(imageUrl, prompt)
      setEditedImage(`data:image/png;base64,${result.editedImageBase64}`)
    } catch (err) {
      console.error('Error editing image:', err)
      setError('Failed to edit image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '20px',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your edit prompt..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        
        <button 
          onClick={handleEditImage}
          disabled={isLoading || !prompt.trim()}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            backgroundColor: (isLoading || !prompt.trim()) ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (isLoading || !prompt.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Editing...' : 'Edit Image'}
        </button>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <div style={{
        display: 'flex',
        gap: '40px',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Original</h3>
          <img 
            src="/cat.png" 
            alt="Original Cat" 
            style={{
              maxWidth: '400px',
              maxHeight: '400px',
              objectFit: 'contain',
              border: '2px solid #ddd',
              borderRadius: '8px'
            }}
          />
        </div>
        
        {editedImage && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Edited</h3>
            <img 
              src={editedImage} 
              alt="Edited Cat" 
              style={{
                maxWidth: '400px',
                maxHeight: '400px',
                objectFit: 'contain',
                border: '2px solid #007bff',
                borderRadius: '8px'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App

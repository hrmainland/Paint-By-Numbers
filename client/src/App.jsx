import { useState } from 'react'
import { editImage, uploadImage } from '../utils/backendCalls'

function App() {
  const [editedImage, setEditedImage] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [prompt, setPrompt] = useState("Turn the cat into a dog")
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }
    
    setIsUploading(true)
    setError(null)
    
    try {
      const result = await uploadImage(selectedFile)
      setUploadedImage(result.imageUrl)
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleEditImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }
    
    if (!uploadedImage) {
      setError('Please upload an image first')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await editImage(uploadedImage, prompt)
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
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            outline: 'none'
          }}
        />
        
        <button 
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            backgroundColor: (isUploading || !selectedFile) ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (isUploading || !selectedFile) ? 'not-allowed' : 'pointer'
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>

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
          disabled={isLoading || !prompt.trim() || !uploadedImage}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            backgroundColor: (isLoading || !prompt.trim() || !uploadedImage) ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (isLoading || !prompt.trim() || !uploadedImage) ? 'not-allowed' : 'pointer'
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
        {uploadedImage && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Original</h3>
            <img 
              src={uploadedImage} 
              alt="Original Image" 
              style={{
                maxWidth: '400px',
                maxHeight: '400px',
                objectFit: 'contain',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </div>
        )}
        
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

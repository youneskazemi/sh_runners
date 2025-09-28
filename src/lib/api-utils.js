// Utility functions for API calls with better error handling

export async function safeApiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get response text first
    const text = await response.text();
    
    // Check if response is empty
    if (!text) {
      throw new Error('Empty response from server');
    }
    
    // Try to parse JSON
    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      console.error('Response text:', text);
      throw new Error('Invalid JSON response from server');
    }
    
  } catch (error) {
    console.error('API call error:', error);
    return { 
      success: false, 
      error: error.message || 'خطا در ارتباط با سرور' 
    };
  }
}

export async function safeJsonResponse(response) {
  try {
    const text = await response.text();
    
    if (!text) {
      return { success: false, error: 'Empty response' };
    }
    
    try {
      return { success: true, data: JSON.parse(text) };
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError, 'Response:', text);
      return { success: false, error: 'Invalid JSON response' };
    }
  } catch (error) {
    console.error('Response processing error:', error);
    return { success: false, error: 'Failed to process response' };
  }
}

// Helper for handling API responses with toast notifications
export function handleApiResponse(result, successMessage = null) {
  if (result.success && result.data) {
    if (result.data.success) {
      if (successMessage) {
        toast.success(successMessage);
      }
      return result.data;
    } else {
      toast.error(result.data.error || 'خطای نامشخص');
      return null;
    }
  } else {
    toast.error(result.error || 'خطا در ارتباط با سرور');
    return null;
  }
}

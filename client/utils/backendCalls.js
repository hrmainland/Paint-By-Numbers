import baseUrl from "./urlPrefix.js";

async function apiRequest(endpoint, method = "GET", body = null) {
    try {
      const options = {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };
  
      if (body) {
        options.body = JSON.stringify(body);
      }
  
      const response = await fetch(`${baseUrl}${endpoint}`, options);
  
      if (response.status === 404) {
        return false;
      }
  
      if (!response.ok) {
        throw new Error(`HTTP error - status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`There was a problem with the request to ${endpoint}`, error);
      throw error;
    }
  }

export async function serverTest() {
    return await apiRequest("/server-test");
}

export async function dbTest() {
    return await apiRequest("/db-test");
}

export async function editImage(imageUrl, prompt) {
    return await apiRequest("/edit-image", "POST", { imageUrl, prompt });
}

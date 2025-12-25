// API base URL - change this to match your PHP backend URL
const API_BASE_URL = 'http://localhost/virtual-garden-assistant/backend';

// API endpoints
const ENDPOINTS = {
  users: `${API_BASE_URL}/api/users`,
  gardens: `${API_BASE_URL}/api/gardens`,
  plants: `${API_BASE_URL}/api/plants`,
  tasks: `${API_BASE_URL}/api/tasks`,
};

// Generic fetch function with error handling
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// User API
export const userAPI = {
  create: (userData: { username: string; email: string; password: string }) => 
    fetchAPI(ENDPOINTS.users, {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  getById: (id: number) => 
    fetchAPI(`${ENDPOINTS.users}/${id}`),
};

// Garden API
export const gardenAPI = {
  create: (gardenData: { user_id: number; name: string; location: string; size: string; description: string }) => 
    fetchAPI(ENDPOINTS.gardens, {
      method: 'POST',
      body: JSON.stringify(gardenData),
    }),
  
  getById: (id: number) => 
    fetchAPI(`${ENDPOINTS.gardens}/${id}`),
  
  getByUserId: (userId: number) => 
    fetchAPI(`${ENDPOINTS.gardens}?user_id=${userId}`),
  
  update: (id: number, gardenData: { name: string; location: string; size: string; description: string }) => 
    fetchAPI(`${ENDPOINTS.gardens}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gardenData),
    }),
  
  delete: (id: number) => 
    fetchAPI(`${ENDPOINTS.gardens}/${id}`, {
      method: 'DELETE',
    }),
};

// Plant API
export const plantAPI = {
  create: (plantData: { 
    garden_id: number; 
    name: string; 
    species: string; 
    planting_date: string; 
    watering_frequency: number; 
    sunlight_needs: string; 
    notes: string 
  }) => 
    fetchAPI(ENDPOINTS.plants, {
      method: 'POST',
      body: JSON.stringify(plantData),
    }),
  
  getById: (id: number) => 
    fetchAPI(`${ENDPOINTS.plants}/${id}`),
  
  getByGardenId: (gardenId: number) => 
    fetchAPI(`${ENDPOINTS.plants}?garden_id=${gardenId}`),
  
  update: (id: number, plantData: { 
    name: string; 
    species: string; 
    planting_date: string; 
    watering_frequency: number; 
    sunlight_needs: string; 
    notes: string 
  }) => 
    fetchAPI(`${ENDPOINTS.plants}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plantData),
    }),
  
  delete: (id: number) => 
    fetchAPI(`${ENDPOINTS.plants}/${id}`, {
      method: 'DELETE',
    }),
  
  getWateringSchedule: (gardenId: number) => 
    fetchAPI(`${ENDPOINTS.plants}/watering-schedule?garden_id=${gardenId}`),
  
  updateLastWatered: (id: number) => 
    fetchAPI(`${ENDPOINTS.plants}/${id}/water`, {
      method: 'PUT',
    }),
};

// Task API
export const taskAPI = {
  create: (taskData: { 
    garden_id: number; 
    title: string; 
    description: string; 
    due_date: string; 
    status: string 
  }) => 
    fetchAPI(ENDPOINTS.tasks, {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  
  getById: (id: number) => 
    fetchAPI(`${ENDPOINTS.tasks}/${id}`),
  
  getByGardenId: (gardenId: number) => 
    fetchAPI(`${ENDPOINTS.tasks}?garden_id=${gardenId}`),
  
  update: (id: number, taskData: { 
    title: string; 
    description: string; 
    due_date: string; 
    status: string 
  }) => 
    fetchAPI(`${ENDPOINTS.tasks}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),
  
  delete: (id: number) => 
    fetchAPI(`${ENDPOINTS.tasks}/${id}`, {
      method: 'DELETE',
    }),
  
  getUpcomingTasks: (gardenId: number) => 
    fetchAPI(`${ENDPOINTS.tasks}/upcoming?garden_id=${gardenId}`),
  
  getOverdueTasks: (gardenId: number) => 
    fetchAPI(`${ENDPOINTS.tasks}/overdue?garden_id=${gardenId}`),
}; 
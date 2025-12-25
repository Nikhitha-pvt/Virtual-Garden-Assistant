import './styles/main.css';
import { GardenList } from './scripts/components/GardenList';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the gardens page
  const gardensContainer = document.getElementById('gardens-container');
  if (gardensContainer) {
  
    const userId = 1;
    
    // Initialize the GardenList component
    const gardenList = new GardenList('gardens-container', userId);
    gardenList.init().catch(error => {
      console.error('Failed to initialize GardenList:', error);
    });
  }
});

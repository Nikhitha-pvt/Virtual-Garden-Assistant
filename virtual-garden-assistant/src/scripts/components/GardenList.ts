import { gardenAPI } from '../api';

// Garden interface
interface Garden {
  id: number;
  user_id: number;
  name: string;
  location: string;
  size: string;
  description: string;
  created_at: string;
  stats?: {
    total_plants: number;
    total_tasks: number;
    pending_tasks: number;
    overdue_tasks: number;
  };
}

// GardenList class
export class GardenList {
  private container: HTMLElement;
  private userId: number;
  private gardens: Garden[] = [];

  constructor(containerId: string, userId: number) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with ID ${containerId} not found`);
    }
    this.container = container;
    this.userId = userId;
  }

  // Initialize the component
  async init() {
    try {
      // Load gardens
      await this.loadGardens();
      
      // Render the gardens
      this.render();
    } catch (error) {
      console.error('Failed to initialize GardenList:', error);
      this.container.innerHTML = '<p class="error">Failed to load gardens. Please try again later.</p>';
    }
  }

  // Load gardens from the API
  private async loadGardens() {
    try {
      this.gardens = await gardenAPI.getByUserId(this.userId);
    } catch (error) {
      console.error('Failed to load gardens:', error);
      throw error;
    }
  }

  // Render the gardens
  private render() {
    if (this.gardens.length === 0) {
      this.container.innerHTML = '<p>No gardens found. Create your first garden!</p>';
      return;
    }

    const gardensHTML = this.gardens.map(garden => this.renderGardenCard(garden)).join('');
    this.container.innerHTML = `
      <div class="garden-list">
        <h2>Your Gardens</h2>
        <div class="garden-grid">
          ${gardensHTML}
        </div>
      </div>
    `;

    // Add event listeners
    this.addEventListeners();
  }

  // Render a single garden card
  private renderGardenCard(garden: Garden) {
    return `
      <div class="garden-card" data-id="${garden.id}">
        <h3>${garden.name}</h3>
        <p class="location">${garden.location}</p>
        <p class="size">${garden.size}</p>
        <p class="description">${garden.description}</p>
        ${garden.stats ? this.renderGardenStats(garden.stats) : ''}
        <div class="garden-actions">
          <button class="view-garden" data-id="${garden.id}">View Garden</button>
          <button class="edit-garden" data-id="${garden.id}">Edit</button>
          <button class="delete-garden" data-id="${garden.id}">Delete</button>
        </div>
      </div>
    `;
  }

  // Render garden stats
  private renderGardenStats(stats: Garden['stats']) {
    if (!stats) return '';
    
    return `
      <div class="garden-stats">
        <div class="stat">
          <span class="stat-value">${stats.total_plants}</span>
          <span class="stat-label">Plants</span>
        </div>
        <div class="stat">
          <span class="stat-value">${stats.total_tasks}</span>
          <span class="stat-label">Tasks</span>
        </div>
        <div class="stat">
          <span class="stat-value">${stats.pending_tasks}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat">
          <span class="stat-value">${stats.overdue_tasks}</span>
          <span class="stat-label">Overdue</span>
        </div>
      </div>
    `;
  }

  // Add event listeners
  private addEventListeners() {
    // View garden button
    this.container.querySelectorAll('.view-garden').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.id;
        if (id) {
          this.viewGarden(parseInt(id));
        }
      });
    });

    // Edit garden button
    this.container.querySelectorAll('.edit-garden').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.id;
        if (id) {
          this.editGarden(parseInt(id));
        }
      });
    });

    // Delete garden button
    this.container.querySelectorAll('.delete-garden').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.id;
        if (id) {
          this.deleteGarden(parseInt(id));
        }
      });
    });
  }

  // View garden
  private viewGarden(id: number) {
    // Navigate to garden view page
    window.location.href = `/garden/${id}`;
  }

  // Edit garden
  private editGarden(id: number) {
    // Navigate to garden edit page
    window.location.href = `/garden/${id}/edit`;
  }

  // Delete garden
  private async deleteGarden(id: number) {
    if (confirm('Are you sure you want to delete this garden? This action cannot be undone.')) {
      try {
        await gardenAPI.delete(id);
        // Remove the garden from the list
        this.gardens = this.gardens.filter(garden => garden.id !== id);
        // Re-render the list
        this.render();
      } catch (error) {
        console.error('Failed to delete garden:', error);
        alert('Failed to delete garden. Please try again later.');
      }
    }
  }
} 
// Notion Service - Uses backend API to avoid CORS issues
// In production (Vercel), use relative path. In development, use localhost:3001
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

// Fetch teachers from backend
export async function fetchTeachers() {
  try {
    const response = await fetch(`${API_BASE}/teachers`);
    if (!response.ok) throw new Error('Failed to fetch teachers');
    return await response.json();
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
}

// Fetch students from backend
export async function fetchStudents() {
  try {
    const response = await fetch(`${API_BASE}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return await response.json();
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

// Fetch subjects from backend
export async function fetchSubjects() {
  try {
    const response = await fetch(`${API_BASE}/subjects`);
    if (!response.ok) throw new Error('Failed to fetch subjects');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

// Fetch all endorsements from backend
export async function fetchNotionEndorsements() {
  try {
    const response = await fetch(`${API_BASE}/endorsements`);
    if (!response.ok) throw new Error('Failed to fetch endorsements');
    return await response.json();
  } catch (error) {
    console.error('Error fetching endorsements:', error);
    return [];
  }
}

// Create endorsement via backend
export async function createNotionEndorsement(endorsement) {
  try {
    const response = await fetch(`${API_BASE}/endorsements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(endorsement),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating endorsement:', error);
    return { success: false, error };
  }
}

// Update endorsement via backend
export async function updateNotionEndorsement(pageId, endorsement) {
  try {
    const response = await fetch(`${API_BASE}/endorsements/${pageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(endorsement),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating endorsement:', error);
    return { success: false, error };
  }
}

// Delete endorsement via backend
export async function deleteNotionEndorsement(pageId) {
  try {
    const response = await fetch(`${API_BASE}/endorsements/${pageId}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting endorsement:', error);
    return { success: false, error };
  }
}

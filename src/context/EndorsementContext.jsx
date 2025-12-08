import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  fetchTeachers,
  fetchStudents,
  fetchSubjects,
  fetchNotionEndorsements,
  createNotionEndorsement,
  updateNotionEndorsement,
  deleteNotionEndorsement,
} from '../utils/notionService';

const EndorsementContext = createContext();

export function EndorsementProvider({ children }) {
  const [endorsements, setEndorsements] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ican-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  // Load data from Notion on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [teachersData, studentsData, subjectsData, endorsementsData] = await Promise.all([
          fetchTeachers(),
          fetchStudents(),
          fetchSubjects(),
          fetchNotionEndorsements(),
        ]);

        // Add substitute teachers manually (or they could be in Notion with a different designation)
        const allTeachers = [
          ...teachersData,
          { id: 'sub-1', name: 'Substitute Teacher 1', email: 'sub1@ican.com', role: 'substitute' },
          { id: 'sub-2', name: 'Substitute Teacher 2', email: 'sub2@ican.com', role: 'substitute' },
        ];

        setTeachers(allTeachers);
        setStudents(studentsData);
        setSubjects(subjectsData);
        setEndorsements(endorsementsData);
      } catch (error) {
        console.error('Error loading data from Notion:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ican-current-user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Create a new endorsement
  const createEndorsement = useCallback(async (endorsementData) => {
    setSyncing(true);
    const newEndorsement = {
      id: uuidv4(),
      ...endorsementData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically add to local state
    setEndorsements((prev) => [...prev, newEndorsement]);

    // Sync to Notion
    try {
      const result = await createNotionEndorsement(newEndorsement);
      if (result.success) {
        // Update with Notion ID
        setEndorsements((prev) =>
          prev.map((e) =>
            e.id === newEndorsement.id ? { ...e, notionId: result.id } : e
          )
        );
      }
    } catch (error) {
      console.error('Error syncing to Notion:', error);
    } finally {
      setSyncing(false);
    }

    return newEndorsement;
  }, []);

  // Update an existing endorsement
  const updateEndorsement = useCallback(async (id, updates) => {
    setSyncing(true);

    // Find the endorsement
    const endorsement = endorsements.find((e) => e.id === id);

    // Optimistically update local state
    setEndorsements((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, ...updates, updatedAt: new Date().toISOString() }
          : e
      )
    );

    // Sync to Notion
    try {
      if (endorsement?.notionId) {
        await updateNotionEndorsement(endorsement.notionId, { ...endorsement, ...updates });
      } else if (endorsement?.id && endorsement.id.length > 30) {
        // It's a Notion ID
        await updateNotionEndorsement(id, { ...endorsement, ...updates });
      }
    } catch (error) {
      console.error('Error updating in Notion:', error);
    } finally {
      setSyncing(false);
    }
  }, [endorsements]);

  // Finalize an endorsement
  const finalizeEndorsement = useCallback((id) => {
    updateEndorsement(id, { finalized: true });
  }, [updateEndorsement]);

  // Delete an endorsement
  const deleteEndorsement = useCallback(async (id) => {
    setSyncing(true);

    const endorsement = endorsements.find((e) => e.id === id);

    // Optimistically remove from local state
    setEndorsements((prev) => prev.filter((e) => e.id !== id));

    // Delete from Notion
    try {
      const notionId = endorsement?.notionId || (id.length > 30 ? id : null);
      if (notionId) {
        await deleteNotionEndorsement(notionId);
      }
    } catch (error) {
      console.error('Error deleting from Notion:', error);
    } finally {
      setSyncing(false);
    }
  }, [endorsements]);

  // Refresh data from Notion
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const endorsementsData = await fetchNotionEndorsements();
      setEndorsements(endorsementsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get endorsements by date
  const getEndorsementsByDate = useCallback((date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return endorsements.filter((e) => e.date === dateStr);
  }, [endorsements]);

  // Get endorsements by teacher
  const getEndorsementsByTeacher = useCallback((teacherId) => {
    // Match by teacher ID, teacher name, or nickname (since Notion may store any of these)
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return [];

    // Normalize for case-insensitive comparison
    const normalize = (str) => (str || '').toLowerCase().trim();
    const teacherName = normalize(teacher.name);
    const teacherNickname = normalize(teacher.nickname);
    const teacherFirstName = normalize(teacher.firstName);

    return endorsements.filter((e) => {
      const endorserName = normalize(e.absentTeacherName);
      return e.absentTeacherId === teacherId ||
             endorserName === teacherName ||
             endorserName === teacherNickname ||
             endorserName === teacherFirstName ||
             // Also check if endorser name contains any of teacher identifiers
             (teacherNickname && endorserName.includes(teacherNickname)) ||
             (teacherFirstName && endorserName.includes(teacherFirstName));
    });
  }, [endorsements, teachers]);

  // Get endorsement by ID
  const getEndorsementById = useCallback((id) => {
    return endorsements.find((e) => e.id === id || e.notionId === id);
  }, [endorsements]);

  // Check if a time slot is already taken
  const isTimeSlotTaken = useCallback((date, timeSlot, teacherId, excludeId = null) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return false;

    const normalize = (str) => (str || '').toLowerCase().trim();
    const teacherName = normalize(teacher.name);
    const teacherNickname = normalize(teacher.nickname);
    const teacherFirstName = normalize(teacher.firstName);

    return endorsements.some((e) => {
      if (e.date !== date || e.timeSlot !== timeSlot) return false;
      if (e.id === excludeId || e.notionId === excludeId) return false;

      const endorserName = normalize(e.absentTeacherName);
      return e.absentTeacherId === teacherId ||
             endorserName === teacherName ||
             endorserName === teacherNickname ||
             endorserName === teacherFirstName;
    });
  }, [endorsements, teachers]);

  // Login user
  const login = useCallback((user) => {
    setCurrentUser(user);
  }, []);

  // Logout user
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('ican-current-user');
  }, []);

  const value = {
    endorsements,
    teachers,
    students,
    subjects,
    currentUser,
    loading,
    syncing,
    createEndorsement,
    updateEndorsement,
    finalizeEndorsement,
    deleteEndorsement,
    getEndorsementsByDate,
    getEndorsementsByTeacher,
    getEndorsementById,
    isTimeSlotTaken,
    login,
    logout,
    refreshData,
  };

  return (
    <EndorsementContext.Provider value={value}>
      {children}
    </EndorsementContext.Provider>
  );
}

export function useEndorsements() {
  const context = useContext(EndorsementContext);
  if (!context) {
    throw new Error('useEndorsements must be used within an EndorsementProvider');
  }
  return context;
}

// Time slots for classes
export const TIME_SLOTS = [
  { id: '8-10', label: '8:00 AM - 10:00 AM', start: '08:00', end: '10:00' },
  { id: '10-12', label: '10:00 AM - 12:00 PM', start: '10:00', end: '12:00' },
  { id: '1-3', label: '1:00 PM - 3:00 PM', start: '13:00', end: '15:00' },
  { id: '3-5', label: '3:00 PM - 5:00 PM', start: '15:00', end: '17:00' },
  { id: '5-7', label: '5:00 PM - 7:00 PM', start: '17:00', end: '19:00' },
];

// Class types offered at ICAN Academy
export const CLASS_TYPES = [
  'Book Club',
  'Grammar to Writing',
  'Reading to Writing',
  'Essay Writing',
  'Debate & Discussion',
  'Reading Comprehension',
  'Vocabulary Building',
  'Speaking & Listening',
  'Test Preparation',
  'Creative Writing',
];

// Sample teachers (in a real app, this would come from a database)
export const TEACHERS = [
  { id: 't1', name: 'Teacher Sarah', email: 'sarah@ican.com', role: 'teacher' },
  { id: 't2', name: 'Teacher Mike', email: 'mike@ican.com', role: 'teacher' },
  { id: 't3', name: 'Teacher Jenny', email: 'jenny@ican.com', role: 'teacher' },
  { id: 't4', name: 'Teacher David', email: 'david@ican.com', role: 'teacher' },
  { id: 't5', name: 'Teacher Lisa', email: 'lisa@ican.com', role: 'substitute' },
  { id: 't6', name: 'Teacher Tom', email: 'tom@ican.com', role: 'substitute' },
];

// Sample students
export const STUDENTS = [
  { id: 's1', name: 'Alice Kim' },
  { id: 's2', name: 'Brian Park' },
  { id: 's3', name: 'Chloe Lee' },
  { id: 's4', name: 'Daniel Choi' },
  { id: 's5', name: 'Emma Jung' },
  { id: 's6', name: 'Felix Han' },
  { id: 's7', name: 'Grace Yoon' },
  { id: 's8', name: 'Henry Kang' },
  { id: 's9', name: 'Irene Song' },
  { id: 's10', name: 'Jason Min' },
];

// ICAN standard homework templates by class type
export const HOMEWORK_TEMPLATES = {
  'Book Club': [
    'Complete Caterpillar activity for the chapter',
    'Prepare Quiz Challenge questions',
    'Write a character analysis',
    'Complete vocabulary worksheet',
  ],
  'Grammar to Writing': [
    'Sentence construction exercises',
    'Visionary Journal entry',
    'Grammar worksheet practice',
    'Writing prompt response',
  ],
  'Essay Writing': [
    'Write a paragraph using the learned structure',
    'Complete outline for next essay',
    'Revise and edit previous draft',
    'Research and note-taking',
  ],
  'Reading to Writing': [
    'Complete reading comprehension questions',
    'Write a summary paragraph',
    'Vocabulary practice',
    'Response journal entry',
  ],
};

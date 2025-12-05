import { useState } from 'react';
import { format } from 'date-fns';
import { useEndorsements } from '../context/EndorsementContext';
import { generateLessonPlan } from '../utils/aiService';

// Generate hourly time options from 8 AM to 9 PM
const TIME_OPTIONS = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
];

export default function EndorsementForm({ endorsement, onSave, onCancel }) {
  const { currentUser, students, subjects, syncing } = useEndorsements();
  const isEditing = !!endorsement;

  const [formData, setFormData] = useState({
    date: endorsement?.date || format(new Date(), 'yyyy-MM-dd'),
    timeFrom: endorsement?.timeFrom || '',
    timeTo: endorsement?.timeTo || '',
    studentName: endorsement?.studentName || '',
    classType: endorsement?.classType || '',
    bookMaterial: endorsement?.bookMaterial || '',
    lastLesson: endorsement?.lastLesson || '',
    nextLesson: endorsement?.nextLesson || '',
    homework: endorsement?.homework || '',
    notes: endorsement?.notes || '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(endorsement?.aiSummary || null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // Calculate duration in hours
  const getDuration = () => {
    if (!formData.timeFrom || !formData.timeTo) return 0;
    const fromHour = parseInt(formData.timeFrom.split(':')[0]);
    const toHour = parseInt(formData.timeTo.split(':')[0]);
    return toHour - fromHour;
  };

  // Format time for display
  const formatTime = (time24) => {
    const option = TIME_OPTIONS.find(t => t.value === time24);
    return option ? option.label : time24;
  };

  const handleGeneratePlan = async () => {
    // Validate required fields
    if (!formData.date || !formData.timeFrom || !formData.timeTo ||
        !formData.studentName || !formData.classType || !formData.bookMaterial ||
        !formData.lastLesson || !formData.nextLesson) {
      setError('Please fill in all required fields before generating the lesson plan.');
      return;
    }

    if (formData.timeFrom >= formData.timeTo) {
      setError('End time must be after start time.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const duration = getDuration();
      const result = await generateLessonPlan({
        ...formData,
        duration,
        teacherName: currentUser.nickname || currentUser.name,
        timeDisplay: `${formatTime(formData.timeFrom)} - ${formatTime(formData.timeTo)}`,
      });

      // Handle both old format (string) and new format (object with polished notes)
      if (typeof result === 'string') {
        setGeneratedPlan(result);
      } else {
        setGeneratedPlan(result.lessonPlan);

        // Update form fields with polished versions
        setFormData((prev) => ({
          ...prev,
          lastLesson: result.polishedLastLesson || prev.lastLesson,
          nextLesson: result.polishedNextLesson || prev.nextLesson,
          homework: result.polishedHomework || prev.homework,
          notes: result.polishedNotes || prev.notes,
        }));
      }
    } catch (err) {
      setError('Failed to generate lesson plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lesson Plan - ${formData.studentName}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
          }
          .info-item label {
            font-weight: 600;
            color: #374151;
            display: block;
            margin-bottom: 4px;
          }
          .info-item span {
            color: #1e293b;
          }
          .section {
            margin-bottom: 25px;
          }
          .section h2 {
            color: #2563eb;
            font-size: 1.1rem;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          .section-content {
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ICAN Academy Lesson Plan</h1>
          <p>Substitute Teacher Guide</p>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>Date</label>
            <span>${formData.date}</span>
          </div>
          <div class="info-item">
            <label>Time</label>
            <span>${formatTime(formData.timeFrom)} - ${formatTime(formData.timeTo)} (${getDuration()} hour${getDuration() > 1 ? 's' : ''})</span>
          </div>
          <div class="info-item">
            <label>Student</label>
            <span>${formData.studentName}</span>
          </div>
          <div class="info-item">
            <label>Class Type</label>
            <span>${formData.classType}</span>
          </div>
          <div class="info-item">
            <label>Book/Material</label>
            <span>${formData.bookMaterial}</span>
          </div>
          <div class="info-item">
            <label>Absent Teacher</label>
            <span>${currentUser.nickname || currentUser.name}</span>
          </div>
        </div>

        <div class="section">
          <h2>Last Lesson Covered</h2>
          <div class="section-content">${formData.lastLesson}</div>
        </div>

        <div class="section">
          <h2>Today's Lesson</h2>
          <div class="section-content">${formData.nextLesson}</div>
        </div>

        <div class="section">
          <h2>Lesson Plan</h2>
          <div class="section-content">${generatedPlan}</div>
        </div>

        ${formData.homework ? `
        <div class="section">
          <h2>Homework</h2>
          <div class="section-content">${formData.homework}</div>
        </div>
        ` : ''}

        ${formData.notes ? `
        <div class="section">
          <h2>Additional Notes</h2>
          <div class="section-content">${formData.notes}</div>
        </div>
        ` : ''}

        <div class="footer">
          Generated by ICAN Teacher Endorsement System
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSubmit = (e, finalize = false) => {
    e.preventDefault();

    // Validation
    if (!formData.date || !formData.timeFrom || !formData.timeTo || !formData.studentName || !formData.classType) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.timeFrom >= formData.timeTo) {
      setError('End time must be after start time.');
      return;
    }

    if (finalize && !generatedPlan) {
      setError('Please generate the lesson plan before finalizing.');
      return;
    }

    onSave({
      ...formData,
      timeSlot: `${formData.timeFrom}-${formData.timeTo}`,
      aiSummary: generatedPlan || '',
      absentTeacherId: currentUser.id,
      absentTeacherName: currentUser.nickname || currentUser.name,
      finalized: finalize,
    });
  };

  return (
    <form className="endorsement-form" onSubmit={(e) => handleSubmit(e, false)}>
      {syncing && (
        <div className="syncing-indicator">
          Syncing with Notion...
        </div>
      )}

      <div className="form-section">
        <h3>Class Information</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Time *</label>
            <div className="time-range">
              <select
                id="timeFrom"
                name="timeFrom"
                value={formData.timeFrom}
                onChange={handleChange}
                required
              >
                <option value="">From</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
              <span className="time-separator">to</span>
              <select
                id="timeTo"
                name="timeTo"
                value={formData.timeTo}
                onChange={handleChange}
                required
              >
                <option value="">To</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>
            {formData.timeFrom && formData.timeTo && formData.timeFrom < formData.timeTo && (
              <p className="duration-hint">
                {getDuration()} hour{getDuration() > 1 ? 's' : ''} ({getDuration() * 50} min teaching + {getDuration() * 10} min break)
              </p>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="studentName">Student Name *</label>
            <select
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.name}>
                  {student.name} {student.englishName ? `(${student.englishName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="classType">Class Type *</label>
            <select
              id="classType"
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              required
            >
              <option value="">Select class type</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bookMaterial">Book / Material *</label>
          <input
            type="text"
            id="bookMaterial"
            name="bookMaterial"
            value={formData.bookMaterial}
            onChange={handleChange}
            placeholder="e.g., Charlotte's Web, Grammar Level 2"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastLesson">Last Lesson Covered *</label>
          <textarea
            id="lastLesson"
            name="lastLesson"
            value={formData.lastLesson}
            onChange={handleChange}
            rows={2}
            placeholder="What was covered in the previous lesson?"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nextLesson">Today's Lesson / What to Cover *</label>
          <textarea
            id="nextLesson"
            name="nextLesson"
            value={formData.nextLesson}
            onChange={handleChange}
            rows={2}
            placeholder="What should the substitute teach today?"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="homework">Homework (Optional)</label>
          <textarea
            id="homework"
            name="homework"
            value={formData.homework}
            onChange={handleChange}
            rows={2}
            placeholder="Homework to assign"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Any special instructions or notes for the substitute"
          />
        </div>
      </div>

      <div className="generate-section">
        <button
          type="button"
          className="generate-btn"
          onClick={handleGeneratePlan}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating Lesson Plan...' : 'Generate Lesson Plan with AI'}
        </button>
        <p className="generate-hint">
          AI will create a detailed, printable lesson plan based on the class duration and your inputs
        </p>
      </div>

      {generatedPlan && (
        <div className="form-section generated-plan-section">
          <div className="section-header">
            <h3>Generated Lesson Plan</h3>
            <button type="button" className="print-btn" onClick={handlePrint}>
              Print Lesson Plan
            </button>
          </div>
          <div className="generated-plan">
            <pre>{generatedPlan}</pre>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="save-btn" disabled={syncing}>
          {isEditing ? 'Update Draft' : 'Save Draft'}
        </button>
        <button
          type="button"
          className="finalize-btn"
          onClick={(e) => handleSubmit(e, true)}
          disabled={syncing || !generatedPlan}
        >
          {isEditing ? 'Update & Finalize' : 'Finalize & Save'}
        </button>
      </div>
    </form>
  );
}

import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useEndorsements } from '../context/EndorsementContext';
import EndorsementDetail from '../components/EndorsementDetail';

export default function SubstituteViewPage() {
  const { currentUser, endorsements, teachers } = useEndorsements();
  const navigate = useNavigate();
  const [viewingEndorsement, setViewingEndorsement] = useState(null);

  // Get the teacher being substituted for
  const viewingTeacher = teachers.find((t) => t.id === currentUser?.viewingTeacherId);

  // Get endorsements for the teacher being substituted
  // Match by ID, full name, nickname, or first name
  const teacherEndorsements = endorsements.filter((e) => {
    const absentName = e.absentTeacherName || '';

    return (
      // Match by teacher ID
      e.absentTeacherId === currentUser?.viewingTeacherId ||
      // Match by exact name matches
      absentName === viewingTeacher?.name ||
      absentName === viewingTeacher?.nickname ||
      absentName === viewingTeacher?.firstName ||
      // Match using stored values from login (in case teachers haven't loaded yet)
      absentName === currentUser?.viewingTeacherNickname ||
      absentName === currentUser?.viewingTeacherFirstName ||
      absentName === currentUser?.viewingTeacherName
    );
  });

  // Only show finalized endorsements to substitutes
  const finalizedEndorsements = teacherEndorsements.filter((e) => e.finalized);

  // Group by date
  const groupedByDate = finalizedEndorsements.reduce((acc, endorsement) => {
    const date = endorsement.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(endorsement);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

  // Format time for display
  const formatTimeSlot = (endorsement) => {
    if (endorsement.timeFrom && endorsement.timeTo) {
      const formatTime = (time) => {
        const [hours] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${displayHour}${ampm}`;
      };
      return `${formatTime(endorsement.timeFrom)} - ${formatTime(endorsement.timeTo)}`;
    }
    return endorsement.timeSlot || 'No time set';
  };

  const handlePrint = (endorsement) => {
    const formatTime = (time) => {
      if (!time) return '';
      const [hours] = time.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayHour}:00 ${ampm}`;
    };

    const duration = endorsement.timeFrom && endorsement.timeTo
      ? parseInt(endorsement.timeTo.split(':')[0]) - parseInt(endorsement.timeFrom.split(':')[0])
      : 1;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lesson Plan - ${endorsement.studentName}</title>
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
            <span>${format(new Date(endorsement.date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div class="info-item">
            <label>Time</label>
            <span>${formatTime(endorsement.timeFrom)} - ${formatTime(endorsement.timeTo)} (${duration} hour${duration > 1 ? 's' : ''})</span>
          </div>
          <div class="info-item">
            <label>Student</label>
            <span>${endorsement.studentName}</span>
          </div>
          <div class="info-item">
            <label>Class Type</label>
            <span>${endorsement.classType}</span>
          </div>
          <div class="info-item">
            <label>Book/Material</label>
            <span>${endorsement.bookMaterial}</span>
          </div>
          <div class="info-item">
            <label>Absent Teacher</label>
            <span>${endorsement.absentTeacherName}</span>
          </div>
        </div>

        <div class="section">
          <h2>Last Lesson Covered</h2>
          <div class="section-content">${endorsement.lastLesson}</div>
        </div>

        <div class="section">
          <h2>Today's Lesson</h2>
          <div class="section-content">${endorsement.nextLesson}</div>
        </div>

        <div class="section">
          <h2>Lesson Plan</h2>
          <div class="section-content">${endorsement.aiSummary}</div>
        </div>

        ${endorsement.homework ? `
        <div class="section">
          <h2>Homework</h2>
          <div class="section-content">${endorsement.homework}</div>
        </div>
        ` : ''}

        ${endorsement.notes ? `
        <div class="section">
          <h2>Additional Notes</h2>
          <div class="section-content">${endorsement.notes}</div>
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

  if (!currentUser?.isSubstitute) {
    return (
      <div className="substitute-view-page">
        <div className="error-message">
          <p>This page is only for substitute teachers.</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="substitute-view-page">
      <div className="page-header">
        <h2>Lesson Plans for {currentUser.viewingTeacherName}</h2>
        <p>View and print lesson plans for the classes you're substituting</p>
      </div>

      {finalizedEndorsements.length === 0 ? (
        <div className="no-endorsements">
          <div className="empty-icon">📋</div>
          <h3>No Lesson Plans Available</h3>
          <p>
            {currentUser.viewingTeacherName} hasn't submitted any finalized lesson plans yet.
          </p>
          <button className="back-btn" onClick={() => navigate('/login')}>
            Go Back
          </button>
        </div>
      ) : (
        <>
          <div className="endorsement-summary">
            <span className="summary-count">{finalizedEndorsements.length}</span>
            <span className="summary-label">lesson plan{finalizedEndorsements.length !== 1 ? 's' : ''} available</span>
          </div>

          <div className="endorsement-list">
            {sortedDates.map((date) => (
              <div key={date} className="date-group">
                <h3 className="date-header">
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  {date === format(new Date(), 'yyyy-MM-dd') && (
                    <span className="today-badge">Today</span>
                  )}
                </h3>

                <div className="endorsement-cards">
                  {groupedByDate[date]
                    .sort((a, b) => (a.timeFrom || '').localeCompare(b.timeFrom || ''))
                    .map((endorsement) => (
                      <div key={endorsement.id} className="substitute-card">
                        <div className="card-header">
                          <span className="card-time">{formatTimeSlot(endorsement)}</span>
                          <span className="card-class-type">{endorsement.classType}</span>
                        </div>

                        <h4 className="card-student">{endorsement.studentName}</h4>
                        <p className="card-material">{endorsement.bookMaterial}</p>

                        <div className="card-preview">
                          <strong>Today's Topic:</strong> {endorsement.nextLesson}
                        </div>

                        <div className="card-actions">
                          <button
                            className="view-btn"
                            onClick={() => setViewingEndorsement(endorsement)}
                          >
                            View Details
                          </button>
                          <button
                            className="print-btn"
                            onClick={() => handlePrint(endorsement)}
                          >
                            Print
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="page-footer">
            <button className="back-btn" onClick={() => navigate('/login')}>
              Back to Home
            </button>
          </div>
        </>
      )}

      {viewingEndorsement && (
        <EndorsementDetail
          endorsement={viewingEndorsement}
          onClose={() => setViewingEndorsement(null)}
          showPrint={true}
          onPrint={() => handlePrint(viewingEndorsement)}
        />
      )}
    </div>
  );
}

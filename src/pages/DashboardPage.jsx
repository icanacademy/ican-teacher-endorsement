import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useEndorsements } from '../context/EndorsementContext';

export default function DashboardPage() {
  const { currentUser, getEndorsementsByDate, getEndorsementsByTeacher } = useEndorsements();
  const navigate = useNavigate();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEndorsements = getEndorsementsByDate(today);
  const myEndorsements = currentUser?.role !== 'substitute'
    ? getEndorsementsByTeacher(currentUser?.id)
    : [];

  const myDrafts = myEndorsements.filter((e) => !e.finalized);
  const myFinalized = myEndorsements.filter((e) => e.finalized);

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h2>Welcome, {currentUser?.name}</h2>
        <p className="date-display">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="dashboard-grid">
        {currentUser?.role !== 'substitute' && (
          <>
            <div className="dashboard-card primary" onClick={() => navigate('/create')}>
              <div className="card-icon">+</div>
              <h3>Create Endorsement</h3>
              <p>Submit a new class endorsement for your absence</p>
            </div>

            <div className="dashboard-card" onClick={() => navigate('/history')}>
              <div className="card-stats">
                <span className="stat-number">{myDrafts.length}</span>
                <span className="stat-label">Drafts</span>
              </div>
              <div className="card-stats">
                <span className="stat-number">{myFinalized.length}</span>
                <span className="stat-label">Finalized</span>
              </div>
              <h3>My Endorsements</h3>
              <p>View and manage your submitted endorsements</p>
            </div>
          </>
        )}

        <div className="dashboard-card" onClick={() => navigate('/view')}>
          <div className="card-stats">
            <span className="stat-number">{todayEndorsements.length}</span>
            <span className="stat-label">Today&apos;s Classes</span>
          </div>
          <h3>View Schedule</h3>
          <p>See all endorsements for today</p>
        </div>
      </div>

      {todayEndorsements.length > 0 && (
        <div className="today-preview">
          <h3>Today&apos;s Endorsements</h3>
          <div className="preview-list">
            {todayEndorsements.slice(0, 3).map((endorsement) => (
              <div key={endorsement.id} className="preview-item">
                <span className="preview-student">{endorsement.studentName}</span>
                <span className="preview-class">{endorsement.classType}</span>
                <span className="preview-time">{endorsement.timeSlot}</span>
              </div>
            ))}
            {todayEndorsements.length > 3 && (
              <p className="preview-more">
                +{todayEndorsements.length - 3} more classes
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

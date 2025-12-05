import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { useEndorsements } from '../context/EndorsementContext';
import TimelineView from '../components/TimelineView';

export default function ViewSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getEndorsementsByDate } = useEndorsements();

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const endorsements = getEndorsementsByDate(dateStr);

  const goToPreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

  return (
    <div className="view-page">
      <div className="page-header">
        <h2>Class Schedule</h2>
        <p>View endorsements submitted by absent teachers</p>
      </div>

      <div className="date-navigation">
        <button className="nav-arrow" onClick={goToPreviousDay}>
          &larr; Previous
        </button>

        <div className="date-display">
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="date-input"
          />
          <span className="date-formatted">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </span>
          {!isToday && (
            <button className="today-btn" onClick={goToToday}>
              Today
            </button>
          )}
        </div>

        <button className="nav-arrow" onClick={goToNextDay}>
          Next &rarr;
        </button>
      </div>

      <div className="schedule-summary">
        <span className="summary-count">
          {endorsements.length} endorsement{endorsements.length !== 1 ? 's' : ''} for this day
        </span>
        {endorsements.length > 0 && (
          <span className="summary-finalized">
            ({endorsements.filter((e) => e.finalized).length} finalized)
          </span>
        )}
      </div>

      {endorsements.length === 0 ? (
        <div className="no-endorsements">
          <p>No endorsements have been submitted for this date.</p>
          <p className="hint">When teachers submit their class endorsements, they will appear here organized by time slot.</p>
        </div>
      ) : (
        <TimelineView endorsements={endorsements} />
      )}
    </div>
  );
}

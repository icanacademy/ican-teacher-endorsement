import { useState } from 'react';
import { TIME_SLOTS } from '../data/constants';
import EndorsementCard from './EndorsementCard';
import EndorsementDetail from './EndorsementDetail';

export default function TimelineView({ endorsements, showActions, onEdit, onDelete }) {
  const [selectedEndorsement, setSelectedEndorsement] = useState(null);

  // Group endorsements by time slot
  const groupedEndorsements = TIME_SLOTS.map((slot) => ({
    ...slot,
    endorsements: endorsements.filter((e) => e.timeSlot === slot.id),
  }));

  return (
    <div className="timeline-view">
      {groupedEndorsements.map((slot) => (
        <div key={slot.id} className="timeline-slot">
          <div className="timeline-header">
            <div className="timeline-time">{slot.label}</div>
            <div className="timeline-count">
              {slot.endorsements.length} class{slot.endorsements.length !== 1 ? 'es' : ''}
            </div>
          </div>

          <div className="timeline-content">
            {slot.endorsements.length === 0 ? (
              <div className="no-classes">No classes scheduled</div>
            ) : (
              <div className="endorsement-grid">
                {slot.endorsements.map((endorsement) => (
                  <EndorsementCard
                    key={endorsement.id}
                    endorsement={endorsement}
                    onClick={() => setSelectedEndorsement(endorsement)}
                    showActions={showActions}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {selectedEndorsement && (
        <EndorsementDetail
          endorsement={selectedEndorsement}
          onClose={() => setSelectedEndorsement(null)}
        />
      )}
    </div>
  );
}

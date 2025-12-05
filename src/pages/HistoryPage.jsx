import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useEndorsements } from '../context/EndorsementContext';
import EndorsementForm from '../components/EndorsementForm';
import EndorsementCard from '../components/EndorsementCard';
import EndorsementDetail from '../components/EndorsementDetail';
import { TIME_SLOTS } from '../data/constants';

export default function HistoryPage() {
  const { currentUser, getEndorsementsByTeacher, updateEndorsement, deleteEndorsement } = useEndorsements();
  const navigate = useNavigate();

  const [editingEndorsement, setEditingEndorsement] = useState(null);
  const [viewingEndorsement, setViewingEndorsement] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'draft', 'finalized'

  const endorsements = getEndorsementsByTeacher(currentUser?.id);

  const filteredEndorsements = endorsements.filter((e) => {
    if (filter === 'draft') return !e.finalized;
    if (filter === 'finalized') return e.finalized;
    return true;
  });

  // Sort by date descending, then by time slot
  const sortedEndorsements = [...filteredEndorsements].sort((a, b) => {
    const dateCompare = new Date(b.date) - new Date(a.date);
    if (dateCompare !== 0) return dateCompare;
    return TIME_SLOTS.findIndex((s) => s.id === a.timeSlot) - TIME_SLOTS.findIndex((s) => s.id === b.timeSlot);
  });

  // Group by date
  const groupedByDate = sortedEndorsements.reduce((acc, endorsement) => {
    const date = endorsement.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(endorsement);
    return acc;
  }, {});

  const handleEdit = (endorsement) => {
    setEditingEndorsement(endorsement);
  };

  const handleSave = (data) => {
    updateEndorsement(editingEndorsement.id, data);
    setEditingEndorsement(null);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this endorsement?')) {
      deleteEndorsement(id);
    }
  };

  if (editingEndorsement) {
    return (
      <div className="history-page">
        <div className="page-header">
          <h2>Edit Endorsement</h2>
          <p>Update the endorsement details</p>
        </div>
        <EndorsementForm
          endorsement={editingEndorsement}
          onSave={handleSave}
          onCancel={() => setEditingEndorsement(null)}
        />
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="page-header">
        <h2>My Endorsements</h2>
        <p>View and manage your submitted endorsements</p>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({endorsements.length})
        </button>
        <button
          className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          Drafts ({endorsements.filter((e) => !e.finalized).length})
        </button>
        <button
          className={`filter-btn ${filter === 'finalized' ? 'active' : ''}`}
          onClick={() => setFilter('finalized')}
        >
          Finalized ({endorsements.filter((e) => e.finalized).length})
        </button>

        <button className="create-btn" onClick={() => navigate('/create')}>
          + New Endorsement
        </button>
      </div>

      {sortedEndorsements.length === 0 ? (
        <div className="no-endorsements">
          <p>No endorsements found.</p>
          <button className="primary-btn" onClick={() => navigate('/create')}>
            Create Your First Endorsement
          </button>
        </div>
      ) : (
        <div className="history-list">
          {Object.entries(groupedByDate).map(([date, dateEndorsements]) => (
            <div key={date} className="date-group">
              <h3 className="date-header">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="endorsement-grid">
                {dateEndorsements.map((endorsement) => (
                  <EndorsementCard
                    key={endorsement.id}
                    endorsement={endorsement}
                    onClick={() => setViewingEndorsement(endorsement)}
                    showActions={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingEndorsement && (
        <EndorsementDetail
          endorsement={viewingEndorsement}
          onClose={() => setViewingEndorsement(null)}
        />
      )}
    </div>
  );
}

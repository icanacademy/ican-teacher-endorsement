import { TIME_SLOTS } from '../data/constants';

export default function EndorsementCard({ endorsement, onClick, showActions, onEdit, onDelete }) {
  const timeSlot = TIME_SLOTS.find((s) => s.id === endorsement.timeSlot);

  return (
    <div
      className={`endorsement-card ${endorsement.finalized ? 'finalized' : 'draft'}`}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="card-time">{timeSlot?.label || endorsement.timeSlot}</div>
        <div className={`card-status ${endorsement.finalized ? 'finalized' : 'draft'}`}>
          {endorsement.finalized ? 'Finalized' : 'Draft'}
        </div>
      </div>

      <div className="card-body">
        <h4 className="card-student">{endorsement.studentName}</h4>
        <p className="card-class">{endorsement.classType}</p>
        <p className="card-book">{endorsement.bookMaterial}</p>
      </div>

      <div className="card-footer">
        <span className="card-teacher">By: {endorsement.absentTeacherName}</span>
      </div>

      {showActions && (
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          {!endorsement.finalized && (
            <button className="edit-btn" onClick={() => onEdit(endorsement)}>
              Edit
            </button>
          )}
          <button className="delete-btn" onClick={() => onDelete(endorsement.id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

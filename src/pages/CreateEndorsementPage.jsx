import { useNavigate } from 'react-router-dom';
import { useEndorsements } from '../context/EndorsementContext';
import EndorsementForm from '../components/EndorsementForm';

export default function CreateEndorsementPage() {
  const { createEndorsement } = useEndorsements();
  const navigate = useNavigate();

  const handleSave = (data) => {
    createEndorsement(data);
    navigate('/history');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="create-page">
      <div className="page-header">
        <h2>Create New Endorsement</h2>
        <p>Fill out the class details and use AI to generate the endorsement content</p>
      </div>

      <EndorsementForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}

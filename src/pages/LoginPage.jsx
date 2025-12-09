import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEndorsements } from '../context/EndorsementContext';

export default function LoginPage() {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubstituteFor, setSelectedSubstituteFor] = useState('');
  const { login, teachers, loading } = useEndorsements();
  const navigate = useNavigate();

  // Helper to get display name - prefer nickname, then first name
  const getDisplayName = (teacher) => {
    return teacher.nickname || teacher.firstName || teacher.name;
  };

  const regularTeachers = teachers
    .filter((t) => t.role !== 'substitute')
    .sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));

  const handleTeacherLogin = (e) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === selectedTeacher);
    if (teacher) {
      login({ ...teacher, isSubstitute: false });
      navigate('/create');
    }
  };

  const handleSubstituteLogin = (e) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === selectedSubstituteFor);
    if (teacher) {
      // Login as substitute viewing this teacher's endorsements
      login({
        id: 'substitute',
        name: 'Substitute Teacher',
        role: 'substitute',
        isSubstitute: true,
        viewingTeacherId: teacher.id,
        viewingTeacherName: getDisplayName(teacher),
        viewingTeacherNickname: teacher.nickname,
        viewingTeacherFirstName: teacher.firstName,
      });
      navigate('/substitute-view');
    }
  };

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <h1>ICAN Teacher Endorsement</h1>
            <p>Loading teachers from Notion...</p>
          </div>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container split-login">
        <div className="login-header">
          <img src="/ican-logo.png" alt="ICAN Academy" className="login-logo" />
          <h1>Class Endorsement</h1>
        </div>

        {/* Teacher Section - Create Endorsement */}
        <div className="login-section teacher-login-section">
          <div className="section-header">
            <div className="section-icon">✏️</div>
            <h2>Create an Endorsement</h2>
          </div>
          <p className="section-description">
            Going to be absent? Select your name below to create a lesson plan for your substitute.
          </p>

          <form onSubmit={handleTeacherLogin}>
            <div className="form-group">
              <label htmlFor="teacher-select">Select Your Name</label>
              <select
                id="teacher-select"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="teacher-dropdown"
              >
                <option value="">-- Choose your name --</option>
                {regularTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {getDisplayName(teacher)}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="login-btn primary-btn" disabled={!selectedTeacher}>
              Create Endorsement
            </button>
          </form>
        </div>

        <div className="login-divider">
          <span>OR</span>
        </div>

        {/* Substitute Section */}
        <div className="login-section substitute-login-section">
          <div className="section-header">
            <div className="section-icon">👀</div>
            <h2>Substitute Teacher?</h2>
          </div>
          <p className="section-description">
            View lesson plans for the teacher you're covering today.
          </p>

          <form onSubmit={handleSubstituteLogin}>
            <div className="form-group">
              <label htmlFor="substitute-select">Select Teacher You're Covering For</label>
              <select
                id="substitute-select"
                value={selectedSubstituteFor}
                onChange={(e) => setSelectedSubstituteFor(e.target.value)}
                className="teacher-dropdown"
              >
                <option value="">-- Choose teacher --</option>
                {regularTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {getDisplayName(teacher)}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="login-btn secondary-btn" disabled={!selectedSubstituteFor}>
              View Lesson Plans
            </button>
          </form>
        </div>

        <p className="teacher-count">{regularTeachers.length} active teachers</p>
      </div>
    </div>
  );
}

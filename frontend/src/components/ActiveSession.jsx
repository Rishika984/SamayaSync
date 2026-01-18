import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from './services/authService';
import { createStudySession } from './services/studyService';
import StartPrompt from './StartPrompt';
import Sidebar from './Sidebar';

function ActiveSession({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const showOnboard = location?.state?.showOnboard;
  const [promptOpen, setPromptOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('');
  const [sessionGoal, setSessionGoal] = useState('');
  const [originalMinutes, setOriginalMinutes] = useState(25);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  
  // Pomodoro states
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [studiedTime, setStudiedTime] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [sessionPhase, setSessionPhase] = useState('study');

  // Subject management states
  const [subjects, setSubjects] = useState(['Mathematics', 'Programming', 'Science', 'English', 'History']);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
      } catch {
        navigate('/welcome', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('startPromptShown');
    if (showOnboard && !alreadyShown) {
      setPromptOpen(true);
      sessionStorage.setItem('startPromptShown', 'true');
    }
  }, [showOnboard]);

  const addNewSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      const updatedSubjects = [...subjects, newSubject.trim()];
      setSubjects(updatedSubjects);
      localStorage.setItem('customSubjects', JSON.stringify(updatedSubjects));
      setCurrentSubject(newSubject.trim());
      setNewSubject('');
      setShowAddSubject(false);
    } else if (subjects.includes(newSubject.trim())) {
      alert('This subject already exists!');
    } else {
      alert('Please enter a valid subject name.');
    }
  };

  const cancelAddSubject = () => {
    setNewSubject('');
    setShowAddSubject(false);
  };

  const saveCompletedSession = useCallback(async () => {
    if (!currentSubject || !sessionStartTime) {
      return;
    }

    try {
      const endTime = new Date();
      const actualDuration = totalStudyTime || originalMinutes;

      // Save to backend
      await createStudySession({
        subject: currentSubject,
        startTime: sessionStartTime,
        endTime: endTime,
        durationMinutes: actualDuration,
        goal: sessionGoal || 'No specific goal set',
      });

      console.log('Session saved to backend successfully');
    } catch (error) {
      console.error('Error saving session to backend:', error);
      alert('Failed to save session. Please try again.');
    }
  }, [currentSubject, sessionGoal, totalStudyTime, originalMinutes, sessionStartTime]);

  useEffect(() => {
    let interval = null;
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0 && isActive) {
      if (sessionPhase === 'study') {
        const studyMinutes = isBreakTime ? 50 : (currentCycle === 1 ? 60 : 50);
        setStudiedTime(prev => prev + studyMinutes);
        
        if (studiedTime + studyMinutes >= totalStudyTime) {
          setIsActive(false);
          saveCompletedSession();
          alert('🎉 Congratulations! You have completed your entire study session! Check your Session Log to see your progress.');
          resetToInitialState();
        } else {
          setSessionPhase('break');
          setMinutes(10);
          setSeconds(0);
          alert('⏰ Study phase completed! Time for a 10-minute break. Relax and recharge! 🌟');
        }
      } else {
        setSessionPhase('study');
        setCurrentCycle(prev => prev + 1);
        
        const remainingTime = totalStudyTime - studiedTime;
        const nextStudyDuration = Math.min(50, remainingTime);
        
        setMinutes(nextStudyDuration);
        setSeconds(0);
        alert('💪 Break time is over! Ready for your next study session? Let\'s focus! 📚');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, sessionPhase, studiedTime, totalStudyTime, currentCycle, isBreakTime, saveCompletedSession]);

  const resetToInitialState = () => {
    setIsBreakTime(false);
    setTotalStudyTime(0);
    setStudiedTime(0);
    setCurrentCycle(1);
    setSessionPhase('study');
    setMinutes(25);
    setOriginalMinutes(25);
    setSeconds(0);
    setSessionStartTime(null);
  };

  const toggleTimer = () => {
    if (!currentSubject && !isActive) {
      alert('Please select a subject before starting the session!');
      return;
    }
    
    if (!isActive && sessionPhase === 'study' && studiedTime === 0) {
      setTotalStudyTime(originalMinutes);
      setSessionStartTime(new Date());
      
      if (originalMinutes >= 60) {
        setMinutes(60);
        setIsBreakTime(true);
      } else {
        setMinutes(originalMinutes);
        setIsBreakTime(false);
      }
    }
    
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    resetToInitialState();
  };

  const incrementTime = () => {
    if (!isActive) {
      const newMinutes = minutes + 5;
      setMinutes(newMinutes);
      setOriginalMinutes(newMinutes);
    }
  };

  const decrementTime = () => {
    if (!isActive) {
      const newMinutes = Math.max(5, minutes - 5);
      setMinutes(newMinutes);
      setOriginalMinutes(newMinutes);
    }
  };

  const formatTime = (mins, secs) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        ☰
      </button>
      {isMobileMenuOpen && <div className="sidebar-overlay active" onClick={closeMobileMenu}></div>}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        darkMode={darkMode}
        toggleDark={() => setDarkMode(prev => !prev)}
      />

      <main className="dashboard-main">
        {/* Session Goal Card */}
        <div className="figma-session-goal-card">
          <h2 className="figma-session-goal-title">Session Goal</h2>
          <textarea 
            className="figma-session-goal-input"
            value={sessionGoal}
            onChange={(e) => setSessionGoal(e.target.value)}
            placeholder="Write your goal for this session... What do you want to accomplish?"
            rows="4"
            disabled={isActive}
          />
        </div>

        {/* Main Content - Two Cards Side by Side */}
        <div className="figma-session-content">
          {/* Get Ready to Focus Card */}
          <div className="figma-focus-card">
            <h2 className="figma-focus-title">
              {sessionPhase === 'break' ? '☕ Break Time' : 'Get ready to focus'}
            </h2>
            <p className="figma-focus-subtitle">
              {sessionPhase === 'break' 
                ? 'Take a break and recharge! You\'ve earned it.' 
                : 'Start a focused session, block distractions, and get closer to your goals—one session at a time.'
              }
            </p>

            {/* Progress Display for Pomodoro */}
            {isActive && totalStudyTime > 0 && (
              <div className="pomodoro-progress">
                <div className="progress-info">
                  <span>Phase: {sessionPhase === 'study' ? '📚 Study' : '☕ Break'}</span>
                  <span>Cycle: {currentCycle}</span>
                  <span>Progress: {studiedTime}/{totalStudyTime} min</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(studiedTime / totalStudyTime) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Subject Selection */}
            <div className="subject-selection">
              <label htmlFor="subject-select">Select Subject:</label>
              {showAddSubject ? (
                <div className="add-subject-section">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Enter new subject name"
                    className="add-subject-input"
                    onKeyPress={(e) => e.key === 'Enter' && addNewSubject()}
                  />
                  <div className="add-subject-buttons">
                    <button 
                      type="button" 
                      onClick={addNewSubject}
                      className="add-subject-save-btn"
                    >
                      Add
                    </button>
                    <button 
                      type="button" 
                      onClick={cancelAddSubject}
                      className="add-subject-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="subject-dropdown-container">
                  <select 
                    id="subject-select"
                    value={currentSubject} 
                    onChange={(e) => setCurrentSubject(e.target.value)}
                    className="subject-dropdown"
                    disabled={isActive}
                  >
                    <option value="">Choose a subject</option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject}>{subject}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => setShowAddSubject(true)}
                    className="add-subject-btn"
                    disabled={isActive}
                  >
                    + Add Subject
                  </button>
                </div>
              )}
            </div>

            <div className="figma-timer-section">
              <div className="figma-timer-display">
                <span className="figma-timer-value">{isActive ? formatTime(minutes, seconds) : minutes}</span>
                <span className="figma-timer-unit">{isActive ? '' : 'min'}</span>
              </div>
              <div className="figma-timer-controls">
                <button className="figma-timer-btn" onClick={incrementTime} disabled={isActive}>▲</button>
                <button className="figma-timer-btn" onClick={decrementTime} disabled={isActive}>▼</button>
              </div>
            </div>

            <div className="figma-session-buttons">
              <button className="figma-start-btn" onClick={toggleTimer}>
                {isActive ? '⏸️ Pause focus session' : 'Start focus session'}
              </button>
              {isActive && (
                <button className="figma-reset-btn" onClick={resetTimer}>
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Current Subject Display */}
          <div className="figma-subject-card">
            <h2 className="figma-subject-title">Current Session</h2>
            <div className="current-subject-display">
              {currentSubject ? (
                <>
                  <div className="selected-subject">{currentSubject}</div>
                  <div className="session-status">
                    {isActive ? '🔴 Session Active' : '⏸️ Ready to Start'}
                  </div>
                </>
              ) : (
                <div className="no-subject">Select a subject to begin</div>
              )}
            </div>
          </div>
        </div>
      </main>
     
      <StartPrompt
        open={promptOpen}
        onConfirm={() => setPromptOpen(false)}
        onCancel={() => setPromptOpen(false)}
      />
    </div>
  );
}

export default ActiveSession;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X, ChevronRight, HelpCircle } from 'lucide-react';

const QuizModal = ({ module, moduleTitle, questions, isOpen = true, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  if (!isOpen && !module) return null;

  const quizQuestions = questions || module?.quizQuestions || module?.quiz || [];
  const title = moduleTitle || module?.title || 'Knowledge Assessment';

  if (quizQuestions.length === 0) {
    return (
      <div className="modal-overlay">
        <div className="modal-content text-center p-6">
          <p className="text-sm text-on-surface-variant">No questions available for this module.</p>
          <button onClick={onClose} className="stitch-btn-primary mt-4 !py-2 !px-4 !text-xs">Close</button>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const answersArray = quizQuestions.map((_, i) => selectedAnswers[i]);
      onComplete(answersArray);
    }
  };

  const currentQuestion = quizQuestions[currentStep];

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content max-w-xl p-6"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
          <div>
            <span className="font-label-sm text-secondary uppercase font-bold text-[10px] tracking-wider">
              Surveying Knowledge
            </span>
            <h3 className="font-title-md text-base font-bold text-on-surface mt-0.5">
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border-0 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-5">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / quizQuestions.length) * 100}%` }} 
          />
        </div>

        {/* Question Details */}
        <div className="flex flex-col gap-3">
          <div className="font-label-sm text-xs font-bold text-on-surface-variant">
            Question {currentStep + 1} of {quizQuestions.length}
          </div>
          <h4 className="font-title-md text-sm font-bold text-on-surface leading-snug">
            {currentQuestion?.question}
          </h4>

          <div className="flex flex-col gap-2 mt-2">
            {currentQuestion?.options?.map((option, idx) => {
              const isSelected = selectedAnswers[currentStep] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentStep]: idx }))}
                  className={`p-3 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-secondary-container border-primary text-on-secondary-container font-bold shadow-xs' 
                      : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border flex-shrink-0 ${
                    isSelected ? 'border-primary bg-primary text-white' : 'border-outline-variant'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-5 mt-4 border-t border-outline-variant/20 flex justify-end">
          <button 
            disabled={selectedAnswers[currentStep] === undefined}
            onClick={handleNext}
            className="stitch-btn-primary !h-11 !px-5 !text-xs disabled:opacity-50"
          >
            <span>{currentStep === quizQuestions.length - 1 ? 'Finish Assessment' : 'Next Question'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizModal;

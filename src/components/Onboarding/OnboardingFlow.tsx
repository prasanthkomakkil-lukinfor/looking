import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (primaryRole: 'seeker' | 'provider') => void;
}

const slides = [
  {
    title: 'Post what you need.',
    subtitle: 'Let providers come to you.',
    emoji: '📝',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'You control who can chat with you.',
    subtitle: 'Every request needs your approval.',
    emoji: '✅',
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Post anonymously if needed.',
    subtitle: 'Keep your details private until you decide.',
    emoji: '🔒',
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'No spam. No unwanted calls.',
    subtitle: 'Messages only from approved providers.',
    emoji: '🛡️',
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Upgrade to unlock full access.',
    subtitle: 'More posts, unlimited chat, instant contact.',
    emoji: '⭐',
    color: 'from-pink-500 to-pink-600',
  },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedRole, setSelectedRole] = useState<'seeker' | 'provider' | null>(null);

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    if (selectedRole) {
      onComplete(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Slide Content */}
      <div className={`flex-1 bg-gradient-to-br ${slide.color} flex items-center justify-center p-6 text-white`}>
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">{slide.emoji}</div>
          <h1 className="text-4xl font-bold mb-4">{slide.title}</h1>
          <p className="text-lg opacity-90">{slide.subtitle}</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-white p-6 border-t border-gray-200">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'bg-blue-600 w-8' : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>

        {/* Role Selection on Last Slide */}
        {currentSlide === slides.length - 1 && (
          <div className="space-y-4 mb-8">
            <p className="text-center font-semibold text-gray-900">What brings you to LookingFor.in?</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedRole('seeker')}
                className={`p-4 rounded-xl border-2 transition-all font-medium ${
                  selectedRole === 'seeker'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-blue-600'
                }`}
              >
                <div className="text-2xl mb-2">🔍</div>
                I'm a Seeker
              </button>
              <button
                onClick={() => setSelectedRole('provider')}
                className={`p-4 rounded-xl border-2 transition-all font-medium ${
                  selectedRole === 'provider'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:border-green-600'
                }`}
              >
                <div className="text-2xl mb-2">⭐</div>
                I'm a Provider
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <span className="text-sm text-gray-600 font-medium">
            {currentSlide + 1} / {slides.length}
          </span>

          {currentSlide === slides.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={!selectedRole}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get Started
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

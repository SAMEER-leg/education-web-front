import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, BookOpen } from 'lucide-react';
import { lessons } from '../../data/cmsData';
import AITutorChat from '../AITutorChat';
export default function LessonPage({
  user
}) {
  const {
    lessonId
  } = useParams();
  const navigate = useNavigate();

  // Find the lesson
  let currentLesson = null;
  for (const sectionLessons of Object.values(lessons)) {
    const found = sectionLessons.find(l => l.id === lessonId);
    if (found) {
      currentLesson = found;
      break;
    }
  }
  if (!currentLesson) {
    return <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#94A3B8]">Lesson not found</p>
      </div>;
  }
  const isPremium = user?.isPremium || false;
  return <>
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.4
        }}>
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-[#94A3B8] hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </button>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="mb-12">
            <h1 className="mb-4">{currentLesson.title}</h1>
            <p className="text-[#94A3B8] text-lg">
              {currentLesson.description}
            </p>
          </motion.div>

          {/* Notes Section - Always Premium */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl overflow-hidden mb-8">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-[#2F6FED] mr-3" />
                  <h2>Lesson Notes</h2>
                </div>
                {!isPremium && <div className="flex items-center text-[#F7C94C] text-sm">
                    <Lock className="w-4 h-4 mr-2" />
                    Premium Only
                  </div>}
              </div>

              {isPremium ? <div className="prose prose-invert max-w-none">
                  <div className="bg-[#0A0E14] rounded-xl p-6 border border-white/5">
                    <h3 className="text-[#A9C7FF] mb-4">Introduction</h3>
                    <p className="text-[#94A3B8] mb-4">
                      This section covers the fundamental concepts of {currentLesson.title.toLowerCase()}. 
                      You'll learn key principles, formulas, and problem-solving techniques.
                    </p>
                    
                    <h3 className="text-[#A9C7FF] mb-4 mt-6">Key Concepts</h3>
                    <ul className="text-[#94A3B8] space-y-2">
                      <li>Understanding the theoretical foundation</li>
                      <li>Applying formulas and methods</li>
                      <li>Solving real-world problems</li>
                      <li>Common mistakes to avoid</li>
                    </ul>

                    <div className="mt-6 p-4 bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-lg">
                      <p className="text-[#A9C7FF] text-sm">
                        💡 <strong>Pro Tip:</strong> Practice is key! Make sure to work through all the practice questions to master this topic.
                      </p>
                    </div>
                  </div>
                </div> : <div className="relative">
                  <div className="blur-sm select-none pointer-events-none">
                    <div className="bg-[#0A0E14] rounded-xl p-6 border border-white/5">
                      <h3 className="text-[#A9C7FF] mb-4">Introduction</h3>
                      <p className="text-[#94A3B8] mb-4">
                        This section covers the fundamental concepts of mathematics. 
                        You'll learn key principles, formulas, and problem-solving techniques.
                      </p>
                      <div className="h-32 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-[#0B1D34]/80 to-[#0B1D34]">
                    <div className="text-center p-8">
                      <Lock className="w-12 h-12 text-[#F7C94C] mx-auto mb-4" />
                      <h3 className="mb-4">Unlock Premium Notes</h3>
                      <p className="text-[#94A3B8] mb-6 max-w-md">
                        Get access to comprehensive notes, detailed explanations, and study guides for all lessons
                      </p>
                      <Link to="/pricing" className="inline-block px-8 py-3 bg-gradient-to-r from-[#F7C94C] to-[#2F6FED] hover:opacity-90 rounded-xl transition-all duration-300">
                        Upgrade to Premium
                      </Link>
                    </div>
                  </div>
                </div>}
            </div>
          </motion.div>

          {/* Practice Questions CTA */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }}>
            <Link to={`/lesson/${lessonId}/questions`} className="block group">
              <div className="bg-gradient-to-br from-[#2F6FED]/20 to-[#F7C94C]/20 border border-[#2F6FED]/30 rounded-2xl p-8 hover:border-[#2F6FED]/50 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-3">Practice Questions</h3>
                    <p className="text-[#94A3B8]">
                      Test your understanding with curated practice problems
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-[#2F6FED] group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* AI Tutor Chat */}
      <AITutorChat />
    </>;
}
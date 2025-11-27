import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, ArrowLeft } from 'lucide-react';
import { getLessonsBySection, subjects } from '../../data/cmsData';
export default function LessonsListPage() {
  const {
    subjectId,
    sectionId
  } = useParams();
  const lessons = getLessonsBySection(sectionId || '');
  const subject = subjects[subjectId];
  const section = subject?.sections.find(s => s.id === sectionId);
  return <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4
      }}>
          <Link to={`/subjects/${subjectId}`} className="inline-flex items-center text-[#94A3B8] hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sections
          </Link>
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
          <h1 className="mb-4">{section?.name || sectionId?.toUpperCase()}</h1>
          <p className="text-[#94A3B8] text-lg">
            {section?.description || 'Select a lesson to begin learning'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => <motion.div key={lesson.id} initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: index * 0.05
        }} whileHover={{
          y: -8
        }}>
              <Link to={`/lesson/${lesson.id}`} className="block group h-full">
                <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6 h-full hover:border-white/30 transition-all duration-300 hover:shadow-xl flex flex-col">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6FED] to-[#A9C7FF] flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="mb-3 group-hover:text-[#A9C7FF] transition-colors duration-300">
                    {lesson.title}
                  </h3>
                  
                  <p className="text-[#94A3B8] text-sm mb-4 flex-1">
                    {lesson.description}
                  </p>

                  <div className="flex items-center text-[#2F6FED] group-hover:text-[#A9C7FF] transition-colors duration-300 text-sm">
                    <span>Start Lesson</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>)}
        </div>

        {lessons.length === 0 && <div className="text-center py-20">
            <p className="text-[#94A3B8]">No lessons available yet</p>
          </div>}
      </div>
    </div>;
}
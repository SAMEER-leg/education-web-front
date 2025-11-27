import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { subjects } from '../../data/cmsData';
export default function SectionsPage() {
  const {
    subjectId
  } = useParams();
  const subject = subjects[subjectId];
  if (!subject) {
    return <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-800">Subject not found</p>
      </div>;
  }

  // IGCSE/O-Level goes directly to lessons (no sections structure)
  if (subject.sections.length === 0) {
    return <Navigate to={`/subjects/${subjectId}/igcse`} replace />;
  }
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
          <Link to="/subjects" className="inline-flex items-center text-[#94A3B8] hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subjects
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
      }} className="text-center mb-16">
          <h1 className="mb-6">{subject.name}</h1>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
            Select a section to access lessons, notes, and practice questions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subject.sections.map((section, index) => <motion.div key={section.id} initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: index * 0.1
        }} whileHover={{
          y: -8
        }}>
              <Link to={`/subjects/${subjectId}/${section.id}`} className="block group">
                <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-start">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2F6FED] to-[#A9C7FF] flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="ml-6 flex-1">
                      <h3 className="mb-3 group-hover:text-[#A9C7FF] transition-colors duration-300">
                        {section.name}
                      </h3>
                      <p className="text-[#94A3B8] text-sm">
                        {section.description}
                      </p>
                      <div className="mt-4 flex items-center text-[#2F6FED] group-hover:text-[#A9C7FF] transition-colors duration-300">
                        <span className="text-sm">View Lessons</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>)}
        </div>
      </div>
    </div>;
}
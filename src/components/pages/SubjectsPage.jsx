import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import { subjects as subjectsData } from '../../data/cmsData';
export default function SubjectsPage() {
  const gradientMap = {
    'as-level': 'from-[#2F6FED] to-[#A9C7FF]',
    'a2-level': 'from-[#A9C7FF] to-[#2F6FED]',
    'igcse': 'from-[#F7C94C] to-[#2F6FED]'
  };
  const subjects = Object.values(subjectsData).map(subject => {
    const sectionSummary = subject.sections?.length ? subject.sections.map(section => section.name).join(', ') : subject.description;
    return {
      ...subject,
      description: subject.description || sectionSummary,
      gradient: gradientMap[subject.id] || 'from-[#2F6FED] to-[#A9C7FF]'
    };
  });
  return <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center mb-16">
          <h1 className="mb-6">Choose Your Subject</h1>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
            Select the course you're studying to access comprehensive notes, practice questions, and expert guidance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subjects.map((subject, index) => <motion.div key={subject.id} initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: index * 0.1
        }} whileHover={{
          y: -12,
          scale: 1.02
        }}>
              <Link to={`/subjects/${subject.id}`} className="block group">
                <div className="relative bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-3xl p-8 h-full hover:border-white/30 transition-all duration-300 hover:shadow-2xl overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center mb-6`}>
                      <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                    
                    <h2 className="mb-4 group-hover:text-[#A9C7FF] transition-colors duration-300">
                      {subject.name}
                    </h2>
                    
                    <p className="text-[#94A3B8]">
                      {subject.description}
                    </p>

                    <div className="mt-6 flex items-center text-[#2F6FED] group-hover:text-[#A9C7FF] transition-colors duration-300">
                      <span className="text-sm">View Sections</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>)}
        </div>
      </div>
    </div>;
}
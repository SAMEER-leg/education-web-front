// CMS Data Structure - In production, this would come from Supabase

export const subjects = {
  'as-level': {
    id: 'as-level',
    name: 'AS Level Maths',
    description: 'Pure 1, Pure 2, Mechanics 1, and Statistics 1',
    sections: [{
      id: 'p1',
      name: 'Pure 1 (P1)',
      description: 'Algebra, functions, and calculus fundamentals'
    }, {
      id: 'p2',
      name: 'Pure 2 (P2)',
      description: 'Advanced algebra, trigonometry, and sequences'
    }, {
      id: 'm1',
      name: 'Mechanics 1 (M1)',
      description: 'Forces, motion, and Newton\'s laws'
    }, {
      id: 's1',
      name: 'Statistics 1 (S1)',
      description: 'Data analysis, probability, and distributions'
    }]
  },
  'a2-level': {
    id: 'a2-level',
    name: 'A2 Level Maths',
    description: 'Pure 3 and Pure 4 for advanced learners',
    sections: [{
      id: 'p3',
      name: 'Pure 3 (P3)',
      description: 'Advanced calculus, differential equations'
    }, {
      id: 'p4',
      name: 'Pure 4 (P4)',
      description: 'Further pure mathematics and complex topics'
    }]
  },
  'igcse': {
    id: 'igcse',
    name: 'IGCSE / O-Level Maths',
    description: 'Complete IGCSE Mathematics curriculum',
    sections: []
  }
};
export const lessons = {
  'p1': [{
    id: 'p1-1',
    title: 'Algebra and Functions',
    description: 'Master algebraic manipulation and function notation',
    sectionId: 'p1'
  }, {
    id: 'p1-2',
    title: 'Quadratic Functions',
    description: 'Solving and graphing quadratic equations',
    sectionId: 'p1'
  }, {
    id: 'p1-3',
    title: 'Graphs and Transformations',
    description: 'Understanding function transformations',
    sectionId: 'p1'
  }, {
    id: 'p1-4',
    title: 'Coordinate Geometry',
    description: 'Lines, circles, and coordinate systems',
    sectionId: 'p1'
  }, {
    id: 'p1-5',
    title: 'Differentiation',
    description: 'Introduction to calculus and derivatives',
    sectionId: 'p1'
  }, {
    id: 'p1-6',
    title: 'Integration',
    description: 'Finding areas and antiderivatives',
    sectionId: 'p1'
  }],
  'p2': [{
    id: 'p2-1',
    title: 'Sequences and Series',
    description: 'Arithmetic and geometric progressions',
    sectionId: 'p2'
  }, {
    id: 'p2-2',
    title: 'Trigonometry',
    description: 'Trigonometric functions and identities',
    sectionId: 'p2'
  }, {
    id: 'p2-3',
    title: 'Exponentials and Logarithms',
    description: 'Laws of logarithms and exponential growth',
    sectionId: 'p2'
  }, {
    id: 'p2-4',
    title: 'Binomial Expansion',
    description: 'Expanding and simplifying binomial expressions',
    sectionId: 'p2'
  }],
  'm1': [{
    id: 'm1-1',
    title: 'Forces and Equilibrium',
    description: 'Understanding forces in equilibrium',
    sectionId: 'm1'
  }, {
    id: 'm1-2',
    title: 'Kinematics',
    description: 'Motion in one and two dimensions',
    sectionId: 'm1'
  }, {
    id: 'm1-3',
    title: 'Newton\'s Laws',
    description: 'Applying Newton\'s laws of motion',
    sectionId: 'm1'
  }, {
    id: 'm1-4',
    title: 'Momentum and Impulse',
    description: 'Conservation of momentum and collisions',
    sectionId: 'm1'
  }],
  's1': [{
    id: 's1-1',
    title: 'Data Representation',
    description: 'Histograms, box plots, and data visualization',
    sectionId: 's1'
  }, {
    id: 's1-2',
    title: 'Probability',
    description: 'Basic probability and tree diagrams',
    sectionId: 's1'
  }, {
    id: 's1-3',
    title: 'Statistical Distributions',
    description: 'Binomial and normal distributions',
    sectionId: 's1'
  }, {
    id: 's1-4',
    title: 'Hypothesis Testing',
    description: 'Testing statistical hypotheses',
    sectionId: 's1'
  }],
  'p3': [{
    id: 'p3-1',
    title: 'Further Calculus',
    description: 'Advanced differentiation and integration techniques',
    sectionId: 'p3'
  }, {
    id: 'p3-2',
    title: 'Differential Equations',
    description: 'Solving first and second order differential equations',
    sectionId: 'p3'
  }, {
    id: 'p3-3',
    title: 'Numerical Methods',
    description: 'Iterative and numerical solution methods',
    sectionId: 'p3'
  }],
  'p4': [{
    id: 'p4-1',
    title: 'Complex Numbers',
    description: 'Operations with complex numbers',
    sectionId: 'p4'
  }, {
    id: 'p4-2',
    title: 'Matrices',
    description: 'Matrix operations and transformations',
    sectionId: 'p4'
  }, {
    id: 'p4-3',
    title: 'Vectors',
    description: 'Vector geometry and applications',
    sectionId: 'p4'
  }],
  'igcse': [{
    id: 'igcse-1',
    title: 'Number',
    description: 'Number operations and properties',
    sectionId: 'igcse'
  }, {
    id: 'igcse-2',
    title: 'Algebra Basics',
    description: 'Algebraic expressions and equations',
    sectionId: 'igcse'
  }, {
    id: 'igcse-3',
    title: 'Graphs',
    description: 'Linear and quadratic graphs',
    sectionId: 'igcse'
  }, {
    id: 'igcse-4',
    title: 'Geometry',
    description: 'Shapes, angles, and geometric properties',
    sectionId: 'igcse'
  }, {
    id: 'igcse-5',
    title: 'Trigonometry',
    description: 'Basic trigonometric ratios',
    sectionId: 'igcse'
  }, {
    id: 'igcse-6',
    title: 'Statistics',
    description: 'Data handling and probability',
    sectionId: 'igcse'
  }]
};
export const questions = {
  'p1-1': [{
    id: 'q1',
    question: 'Simplify: (3x + 2)(2x - 5)',
    answer: '6x² - 11x - 10',
    isPremium: false
  }, {
    id: 'q2',
    question: 'Solve: 2x² + 5x - 3 = 0',
    answer: 'x = 0.5 or x = -3',
    isPremium: false
  }, {
    id: 'q3',
    question: 'Factor completely: x³ - 8',
    answer: '(x - 2)(x² + 2x + 4)',
    isPremium: false
  }, {
    id: 'q4',
    question: 'Find the domain of f(x) = √(x - 3)',
    answer: 'x ≥ 3',
    isPremium: false
  }, {
    id: 'q5',
    question: 'If f(x) = 2x + 1, find f⁻¹(x)',
    answer: 'f⁻¹(x) = (x - 1)/2',
    isPremium: false
  }, {
    id: 'q6',
    question: 'Simplify: (x² - 9)/(x - 3)',
    answer: 'x + 3 (x ≠ 3)',
    isPremium: false
  }, {
    id: 'q7',
    question: 'Solve the simultaneous equations: 2x + y = 7 and x - y = 2',
    answer: 'x = 3, y = 1',
    isPremium: true
  }, {
    id: 'q8',
    question: 'Express 0.˙6˙ as a fraction',
    answer: '2/3',
    isPremium: true
  }, {
    id: 'q9',
    question: 'Find the range of g(x) = x² + 4x + 1',
    answer: 'g(x) ≥ -3',
    isPremium: true
  }, {
    id: 'q10',
    question: 'Solve: |2x - 3| = 7',
    answer: 'x = 5 or x = -2',
    isPremium: true
  }]
};

// Helper function to get all lessons for a section
export function getLessonsBySection(sectionId) {
  return lessons[sectionId] || [];
}

// Helper function to get questions for a lesson
export function getQuestionsByLesson(lessonId) {
  return questions[lessonId] || [];
}
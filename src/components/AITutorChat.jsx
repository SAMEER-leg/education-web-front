import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2, Camera, Image as ImageIcon, Trash2, RefreshCw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getLessonById } from '../services/publicService';
import { API_BASE_URL } from '../config/api';
import { sendAIMessage as sendAIMessageService } from '../services/chatService';

// Helper function to format message text with markdown-like support
const formatMessageText = (text) => {
  if (!text) return '';
  let formatted = text;
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/^[•\-]\s+/gm, '• ');
  formatted = formatted.replace(/\n/g, '<br />');
  return formatted;
};

// Memoized Message Item to prevent unnecessary re-renders
import { memo } from 'react';

const MessageItem = memo(({ message, index, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
    >
      <div className="relative flex items-start gap-2">
        <button
          onClick={() => onDelete(index)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded-lg ${message.sender === 'user' ? 'order-2' : 'order-1'}`}
          title="Delete message"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>

        <div
          className={`${message.image ? 'max-w-[75%]' : 'max-w-[85%]'} px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 ease-in-out ${message.sender === 'user'
            ? 'text-white rounded-br-md order-1'
            : 'bg-gradient-to-br from-white/10 to-white/5 text-[#E2E8F0] border border-white/10 rounded-bl-md order-2'
            }`}
          style={message.sender === 'user' ? {
            background: 'linear-gradient(50deg, #11282b, #06b5cc)',
            willChange: 'transform'
          } : { willChange: 'transform' }}
        >
          {message.image && (
            <div className="mb-3 bg-white/5 p-2 rounded-lg">
              <img
                src={message.image}
                alt="Uploaded homework"
                className="rounded-lg w-full h-auto max-h-48 object-contain border border-white/10"
                loading="lazy"
              />
            </div>
          )}
          <div
            className="text-sm leading-relaxed formatted-message"
            dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
          />
          {message.sender === 'ai' && message.confidence && (
            <div className="mt-3 pt-2 border-t border-white/10">
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-full font-medium">
                <span className="text-green-400">✓</span>
                {message.confidence} confidence
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default function AITutorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHeight, setChatHeight] = useState('450px');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { lessonId } = useParams();

  // Get lesson context - define early to avoid hoisting issues
  const [lessonContext, setLessonContext] = useState(null);

  // Generate or retrieve session ID - make it lesson-specific
  useEffect(() => {
    if (lessonId) {
      // Create lesson-specific session ID (consistent for same lesson)
      const lessonSessionId = `lesson_${lessonId}`;
      setSessionId(lessonSessionId);
    } else {
      // Fallback for general chat
      let storedSessionId = localStorage.getItem('chatSessionId');
      if (!storedSessionId) {
        storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chatSessionId', storedSessionId);
      }
      setSessionId(storedSessionId);
    }
  }, [lessonId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && sessionId) {
      try {
        localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [messages, sessionId]);

  // Load messages from localStorage on mount - but only if lesson context matches
  useEffect(() => {
    if (sessionId && messages.length === 0 && lessonContext) {
      try {
        const storedMessages = localStorage.getItem(`chat_messages_${sessionId}`);
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          // Check if first message matches current lesson title
          const firstMessage = parsedMessages[0];
          if (firstMessage && firstMessage.text && lessonContext.title) {
            const messageContainsTitle = firstMessage.text.includes(lessonContext.title);
            if (messageContainsTitle) {
              setMessages(parsedMessages);
              console.log('✅ Loaded', parsedMessages.length, 'messages from localStorage for lesson:', lessonContext.title);
            } else {
              // Clear old messages if lesson doesn't match
              console.log('⚠️ Clearing old messages - lesson mismatch');
              localStorage.removeItem(`chat_messages_${sessionId}`);
            }
          } else {
            setMessages(parsedMessages);
          }
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }, [sessionId, lessonContext]);

  // No backend save - only localStorage
  // Messages are automatically saved via useEffect above

  // Fetch lesson context
  useEffect(() => {
    const fetchLessonContext = async () => {
      if (!lessonId) {
        setLessonContext(null);
        return;
      }

      try {
        const result = await getLessonById(lessonId);
        if (result.success && result.data) {
          setLessonContext({
            title: result.data.title,
            description: result.data.description || '',
            content: result.data.content || '',
            subject: result.data.subject || '',
            chapter: result.data.chapter || '',
            class: result.data.class || ''
          });
        } else {
          setLessonContext(null);
        }
      } catch (err) {
        console.error('Error fetching lesson context:', err);
        setLessonContext(null);
      }
    };

    fetchLessonContext();
  }, [lessonId]);

  const getLessonContext = () => {
    return lessonContext;
  };

  // Check if message is a greeting
  const isGreeting = (message) => {
    const greetings = ['hello', 'hi', 'hey', 'salam', 'assalamu alaikum', 'namaste', 'good morning', 'good afternoon', 'good evening'];
    const lowerMessage = message.toLowerCase().trim();
    return greetings.some(greeting => lowerMessage.includes(greeting));
  };

  // Check if message is lesson-related (basic client-side check)
  const isLessonRelated = (message, lessonContext) => {
    const lowerMessage = message.toLowerCase().trim();

    // Check for obvious irrelevant keywords
    const irrelevantPatterns = [
      /^(what|who|where|when) are you/i,
      /^(tell me|give me) (a joke|jokes|funny)/i,
      /^(what's|what is) the weather/i,
      /^(tell me about|what do you know about) (movies|music|sports|news|politics)/i,
      /^(how old|what's your age|when were you born)/i,
      /^(where do you live|what's your location)/i,
      /^(do you have|are you in) (a relationship|dating)/i
    ];

    const isObviousIrrelevant = irrelevantPatterns.some(pattern =>
      pattern.test(lowerMessage)
    );

    if (isObviousIrrelevant) return false;

    // If there's lesson context, check if message mentions lesson-related terms
    if (lessonContext) {
      const lessonTitleWords = lessonContext.title.toLowerCase().split(/\s+/);
      const hasLessonWord = lessonTitleWords.some(word =>
        word.length > 3 && lowerMessage.includes(word)
      );

      // Common educational keywords
      const educationalKeywords = [
        'explain', 'understand', 'how', 'why', 'what is', 'what are',
        'formula', 'example', 'practice', 'question', 'problem', 'solve',
        'calculate', 'definition', 'meaning', 'difference', 'similar',
        'compare', 'lesson', 'topic', 'concept', 'subject', 'chapter'
      ];

      const hasEducationalKeyword = educationalKeywords.some(keyword =>
        lowerMessage.includes(keyword)
      );

      // If it has lesson word or educational keyword, consider it related
      // Otherwise, let OpenAI decide based on system prompt
      return hasLessonWord || hasEducationalKeyword || lowerMessage.length > 20;
    }

    // If no lesson context, be more lenient but still check for obvious irrelevant
    return true;
  };

  // Handle window resize for chat height
  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth >= 768) {
        setChatHeight('450px');
      } else {
        setChatHeight('calc(100vh - 72px)');
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Initialize with welcome message (only if no history loaded)
  // Wait for lesson context to load before showing welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && sessionId) {
      // Wait for lesson context to be fetched
      const checkAndShowWelcome = () => {
        if (messages.length === 0) {
          const lessonContext = getLessonContext();
          const welcomeMessage = lessonContext && lessonContext.title
            ? `Hi! 👋 I'm your AI tutor for "${lessonContext.title}". Ask me anything about this lesson!`
            : `Hi! 👋 I'm your AI tutor. Ask me anything about your lessons!`;

          const welcomeMsg = {
            text: welcomeMessage,
            sender: "ai"
          };
          setMessages([welcomeMsg]);
        }
      };

      // If lesson context is already loaded, show welcome immediately
      if (lessonContext) {
        checkAndShowWelcome();
      } else {
        const timeout = setTimeout(() => {
          checkAndShowWelcome();
        }, 100); // Reduced from 1000ms
        return () => clearTimeout(timeout);
      }
    }
  }, [isOpen, sessionId, lessonContext, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload and analysis
  const handleImageUpload = async () => {
    if (!selectedImage || isLoading) return;

    setIsLoading(true);

    // Get user text message if provided
    const userText = input.trim() || '📷 Analyzing homework image...';

    // Add user message with image
    const newMessages = [...messages, {
      text: userText,
      sender: 'user',
      image: imagePreview,
      imageFile: selectedImage.name
    }];
    setMessages(newMessages);

    // Clear selection and input
    const imageFile = selectedImage;
    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('message', userText); // Send text message with image

      // Call backend API
      const response = await fetch(`${API_BASE_URL}/ai/analyze-image`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze image');
      }

      // Add AI response
      const aiMessage = {
        text: data.data.aiResponse,
        sender: 'ai',
        confidence: data.data.confidence,
        imageUrl: data.data.imageUrl
      };
      setMessages([...newMessages, aiMessage]);

    } catch (error) {
      console.error('Image Analysis Error:', error);
      const errorMessage = {
        text: `❌ Sorry, I couldn't analyze the image. ${error.message}`,
        sender: 'ai'
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete individual message
  const deleteMessage = (indexToDelete) => {
    const updatedMessages = messages.filter((_, index) => index !== indexToDelete);
    setMessages(updatedMessages);
    // Update localStorage
    if (sessionId) {
      localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(updatedMessages));
    }
  };

  // Clear all messages
  const clearAllMessages = () => {
    setMessages([]);
    // Clear from localStorage
    if (sessionId) {
      localStorage.removeItem(`chat_messages_${sessionId}`);
    }
    // Show welcome message again
    setTimeout(() => {
      const lessonContext = getLessonContext();
      const welcomeMessage = lessonContext
        ? `Hi! 👋 I'm your AI tutor for "${lessonContext.title}". Ask me anything about this lesson!`
        : `Hi! 👋 I'm your AI tutor. Ask me anything about your lessons!`;

      const welcomeMsg = {
        text: welcomeMessage,
        sender: "ai"
      };
      setMessages([welcomeMsg]);
    }, 100);
  };

  // Call AI tutor via secure backend endpoint (API key is on backend, not exposed to frontend)
  const callOpenAI = async (userMessage, conversationHistory, lessonContext) => {
    try {
      // Use the secure backend endpoint instead of calling OpenAI directly
      const result = await sendAIMessageService(
        userMessage,
        conversationHistory,
        lessonContext?.id || lessonId || null,
        sessionId
      );

      if (!result.success) {
        // Handle rate limiting
        if (result.rateLimited) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        }
        throw new Error(result.message || 'Failed to get AI response');
      }

      return result.data.response;
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const lessonContext = getLessonContext();

    // Add user message
    const newMessages = [...messages, {
      text: userMessage,
      sender: "user"
    }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Handle greetings
      if (isGreeting(userMessage)) {
        const greetingResponse = lessonContext
          ? `Hello! I'm here to help you with "${lessonContext.title}". What would you like to know about this lesson?`
          : "Hello! I'm your AI tutor. How can I help you with your lesson today?";

        setTimeout(() => {
          const aiMessage = {
            text: greetingResponse,
            sender: 'ai'
          };
          setMessages([...newMessages, aiMessage]);
          setIsLoading(false);
        }, 500);
        return;
      }

      // Check if question is lesson-related (client-side basic check)
      const isRelated = isLessonRelated(userMessage, lessonContext);

      if (!isRelated) {
        setTimeout(() => {
          const aiMessage = {
            text: "Main sirf lesson se related sawaalon ka jawab de sakta hoon.",
            sender: 'ai'
          };
          setMessages([...newMessages, aiMessage]);
          setIsLoading(false);
        }, 500);
        return;
      }

      // Prepare conversation history (exclude welcome message)
      const conversationHistory = messages
        .filter((msg, index) => index > 0) // Skip first welcome message
        .map(msg => ({
          text: msg.text,
          sender: msg.sender
        }));

      // Call OpenAI API
      const aiResponse = await callOpenAI(userMessage, conversationHistory, lessonContext);

      const aiMessage = {
        text: aiResponse,
        sender: 'ai'
      };
      setMessages([...newMessages, aiMessage]);

    } catch (error) {
      console.error('AI Tutor Error:', error);
      const errorMessage = {
        text: error.message || 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai'
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#11282b] via-[#06b5cc] to-[#0d3b44] rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-[#06b5cc]/50 transition-all group"
          >
            <MessageSquare className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#111113] animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden" // Removed backdrop-blur for performance
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 w-full md:bottom-6 md:right-6 md:w-96 bg-[#111113] border-l md:border border-white/10 md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
              style={{
                height: chatHeight,
                willChange: 'transform, opacity'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-[#111113] to-[#11282b]">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#11282b] via-[#06b5cc] to-[#0d3b44] rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">AI Tutor</h3>
                    <p className="text-xs text-[#94A3B8] flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Online • Ready to help
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Clear all messages button */}
                  <button
                    onClick={clearAllMessages}
                    disabled={messages.length === 0}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                    title="Clear all messages"
                  >
                    <RefreshCw className="w-4 h-4 text-[#94A3B8] group-hover:text-red-400 transition-colors" />
                  </button>
                  {/* Close button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all hover:rotate-90"
                    title="Close chat"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                className="p-4 space-y-4 bg-[#111113]"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  minHeight: 0
                }}
              >
                {messages.map((message, index) => (
                  <MessageItem
                    key={index}
                    message={message}
                    index={index}
                    onDelete={deleteMessage}
                  />
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-bl-md shadow-lg">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                        <div>
                          <p className="text-sm text-[#E2E8F0] font-medium">AI is analyzing...</p>
                          <p className="text-xs text-[#94A3B8] mt-0.5">Please wait a moment</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div
                className="p-4 border-t border-white/10 bg-gradient-to-r from-[#111113] to-[#1a2942]"
                style={{ flexShrink: 0 }}
              >
                {/* Image Preview */}
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 bg-white/5 p-2 rounded-lg border border-white/10"
                  >
                    <div className="relative group flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={imagePreview}
                          alt="Selected"
                          className="h-16 w-16 object-cover rounded-lg border border-primary-cyan"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#94A3B8] flex items-center gap-1">
                          <span>📷</span>
                          <span className="font-medium text-white">Image ready to upload</span>
                        </p>
                        {selectedImage && (
                          <p className="text-xs text-[#94A3B8] mt-1 truncate">
                            {selectedImage.name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={clearSelectedImage}
                        className="flex-shrink-0 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg p-2 transition-all"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Camera/Image upload button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group hover:border-[#06b5cc]/50"
                    title="Upload homework image"
                  >
                    <Camera className="w-5 h-5 text-[#94A3B8] group-hover:text-white transition-colors" />
                  </button>

                  {/* Text input */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        // If image is selected, upload image instead of sending text
                        if (selectedImage) {
                          handleImageUpload();
                        } else {
                          handleSend();
                        }
                      }
                    }}
                    placeholder={selectedImage ? "📷 Add a message with your image (optional)" : "Ask about the lesson..."}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#06b5cc] focus:ring-2 focus:ring-[#06b5cc]/20 transition-all text-sm text-white placeholder:text-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed"
                  />

                  {/* Send button - changes based on whether image is selected */}
                  <button
                    onClick={selectedImage ? handleImageUpload : handleSend}
                    disabled={isLoading || (!input.trim() && !selectedImage)}
                    className="px-5 py-3 w-10 bg-gradient-to-r from-[#11282b] to-[#06b5cc] hover:from-[#06b5cc] hover:to-[#11282b] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-[#06b5cc]/50 hover:scale-105"
                    title={selectedImage ? "Analyze image" : "Send message"}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : selectedImage ? (
                      <ImageIcon className="w-5 h-5 text-white" />
                    ) : (
                      <Send className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence >
    </>
  );
}

import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const SettingsContext = createContext(null);

// Empty default settings - all data should come from admin dashboard
const defaultSettings = {
  branding: {
    platformName: '',
    logo: '',
    favicon: '',
    tagline: '',
    currency: 'USD'
  },
  contact: {
    supportEmail: '',
    phone: '',
    address: '',
    businessHours: {
      weekdays: '',
      weekends: ''
    },
    socialLinks: {
      instagram: '',
      facebook: '',
      whatsapp: ''
    }
  },
  homepage: {
    hero: {
      title: '',
      description: '',
      ctaText: '',
      heroImage: ''
    },
    features: [],
    cta: {
      title: '',
      description: ''
    }
  },
  about: {
    title: '',
    subtitle: '',
    whoWeAre: '',
    whatWeOffer: '',
    commitment: '',
    featureCards: []
  },
  footer: {
    tagline: '',
    quickLinks: [],
    legalLinks: [],
    copyrightText: ''
  },
  navbar: {
    links: []
  },
  policies: {
    privacyPolicy: {
      content: '',
      lastUpdated: ''
    },
    termsOfService: {
      content: '',
      lastUpdated: ''
    },
    refundPolicy: {
      content: '',
      lastUpdated: ''
    }
  },
  support: {
    title: '',
    description: '',
    responseTime: '',
    categories: []
  },
  pricingPage: {
    title: '',
    description: '',
    freePlanFeatures: [],
    trustStats: [],
    faqs: []
  },
  sampleContent: {
    title: '',
    description: '',
    samples: []
  }
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async (retryCount = 0) => {
    const MAX_RETRIES = 2;

    try {
      setLoading(true);
      setError(null);

      // Start the request
      const response = await fetch(`${API_BASE_URL}/settings`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        const apiSettings = data.data;

        // Ensure structures exist with proper defaults
        const finalSettings = {
          branding: {
            platformName: apiSettings.branding?.platformName || '',
            logo: apiSettings.branding?.logo || '',
            favicon: apiSettings.branding?.favicon || '',
            tagline: apiSettings.branding?.tagline || '',
            currency: apiSettings.branding?.currency || 'USD'
          },
          contact: {
            supportEmail: apiSettings.contact?.supportEmail || '',
            phone: apiSettings.contact?.phone || '',
            address: apiSettings.contact?.address || '',
            businessHours: {
              weekdays: apiSettings.contact?.businessHours?.weekdays || '',
              weekends: apiSettings.contact?.businessHours?.weekends || ''
            },
            socialLinks: {
              instagram: apiSettings.contact?.socialLinks?.instagram || '',
              facebook: apiSettings.contact?.socialLinks?.facebook || '',
              whatsapp: apiSettings.contact?.socialLinks?.whatsapp || ''
            }
          },
          homepage: {
            hero: {
              title: apiSettings.homepage?.hero?.title || '',
              description: apiSettings.homepage?.hero?.description || '',
              ctaText: apiSettings.homepage?.hero?.ctaText || '',
              heroImage: apiSettings.homepage?.hero?.heroImage || ''
            },
            features: Array.isArray(apiSettings.homepage?.features) ? apiSettings.homepage.features : [],
            cta: {
              title: apiSettings.homepage?.cta?.title || '',
              description: apiSettings.homepage?.cta?.description || ''
            }
          },
          about: {
            title: apiSettings.about?.title || '',
            subtitle: apiSettings.about?.subtitle || '',
            whoWeAre: apiSettings.about?.whoWeAre || '',
            whatWeOffer: apiSettings.about?.whatWeOffer || '',
            commitment: apiSettings.about?.commitment || '',
            featureCards: Array.isArray(apiSettings.about?.featureCards) ? apiSettings.about.featureCards : []
          },
          footer: {
            tagline: apiSettings.footer?.tagline || '',
            quickLinks: Array.isArray(apiSettings.footer?.quickLinks) ? apiSettings.footer.quickLinks : [],
            legalLinks: Array.isArray(apiSettings.footer?.legalLinks) ? apiSettings.footer.legalLinks : [],
            copyrightText: apiSettings.footer?.copyrightText || ''
          },
          navbar: {
            links: Array.isArray(apiSettings.navbar?.links) ? apiSettings.navbar.links : []
          },
          policies: {
            privacyPolicy: {
              content: apiSettings.policies?.privacyPolicy?.content || '',
              lastUpdated: apiSettings.policies?.privacyPolicy?.lastUpdated || ''
            },
            termsOfService: {
              content: apiSettings.policies?.termsOfService?.content || '',
              lastUpdated: apiSettings.policies?.termsOfService?.lastUpdated || ''
            },
            refundPolicy: {
              content: apiSettings.policies?.refundPolicy?.content || '',
              lastUpdated: apiSettings.policies?.refundPolicy?.lastUpdated || ''
            }
          },
          support: {
            title: apiSettings.support?.title || '',
            description: apiSettings.support?.description || '',
            responseTime: apiSettings.support?.responseTime || '',
            categories: Array.isArray(apiSettings.support?.categories) ? apiSettings.support.categories : []
          },
          pricingPage: {
            title: apiSettings.pricingPage?.title || '',
            description: apiSettings.pricingPage?.description || '',
            freePlanFeatures: Array.isArray(apiSettings.pricingPage?.freePlanFeatures) ? apiSettings.pricingPage.freePlanFeatures : [],
            trustStats: Array.isArray(apiSettings.pricingPage?.trustStats) ? apiSettings.pricingPage.trustStats : [],
            faqs: Array.isArray(apiSettings.pricingPage?.faqs) ? apiSettings.pricingPage.faqs : []
          },
          sampleContent: {
            title: apiSettings.sampleContent?.title || '',
            description: apiSettings.sampleContent?.description || '',
            samples: Array.isArray(apiSettings.sampleContent?.samples) ? apiSettings.sampleContent.samples : []
          }
        };

        setSettings(finalSettings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
      
      if (retryCount < MAX_RETRIES && (err.name === 'TypeError' || err.name === 'AbortError')) {
        setTimeout(() => fetchSettings(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      setError(err);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  // Deep merge utility with array handling - prioritize source (API data) over target (defaults)
  const deepMerge = (target, source) => {
    if (!source || typeof source !== 'object') {
      return target;
    }

    const output = { ...target };

    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        const sourceValue = source[key];
        const targetValue = target[key];

        // Handle arrays - use source array (even if empty) - it's from API
        if (Array.isArray(sourceValue)) {
          output[key] = sourceValue; // Always use source array
        } else if (isObject(sourceValue)) {
          if (!(key in target) || !isObject(targetValue)) {
            output[key] = { ...sourceValue };
          } else {
            output[key] = deepMerge(targetValue, sourceValue);
          }
        } else {
          // For primitives: prioritize source value even if it's empty string
          // Empty string means admin cleared the field intentionally
          if (sourceValue !== undefined && sourceValue !== null) {
            output[key] = sourceValue; // Use source value (even empty string)
          } else if (key in source) {
            // Key exists in source but is null/undefined - use it (admin cleared it)
            output[key] = sourceValue;
          }
          // If key doesn't exist in source, keep target value
        }
      });
    }

    return output;
  };

  const isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date);
  };

  const value = {
    settings,
    loading,
    error,
    refetch: fetchSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    // Fallback if used outside provider
    return {
      settings: defaultSettings,
      loading: false,
      error: null,
      refetch: () => { }
    };
  }

  return context;
}


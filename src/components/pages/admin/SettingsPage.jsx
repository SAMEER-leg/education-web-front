import { useState, useEffect } from 'react';
import { Save, User, Lock, Bell, Globe, Palette, Loader2, Upload, FileText, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '../../admin/AdminLayout';
import RichTextEditor from '../../admin/RichTextEditor';
import { useAuth } from '../../../contexts/AuthContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { API_BASE_URL } from '../../../config/api';
import axios from 'axios';

export default function SettingsPage() {
  const { user, token } = useAuth();
  const { refetch: refetchGlobalSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePolicy, setActivePolicy] = useState('privacyPolicy');

  // Real settings state
  const [settings, setSettings] = useState({
    branding: {
      platformName: '',
      tagline: '',
      logo: '',
      favicon: '',
      currency: 'USD',
      colors: {
        primary: '#06b5cc',
        secondary: '#11282b',
        accent: '#0d454e',
        background: '#111113'
      }
    },
    contact: {
      supportEmail: '',
      phone: '',
      address: '',
      socialLinks: {
        instagram: '',
        facebook: '',
        whatsapp: ''
      }
    },
    about: {
      title: '',
      subtitle: '',
      whoWeAre: '',
      whatWeOffer: ''
    },
    sampleContent: {
      title: '',
      description: ''
    },
    support: {
      title: '',
      description: '',
      responseTime: '',
      categories: []
    },
    pricingPage: {
      title: '',
      description: ''
    },
    footer: {
      tagline: '',
      copyrightText: ''
    },
    policies: {
      privacyPolicy: { content: '' },
      termsOfService: { content: '' },
      refundPolicy: { content: '' }
    }
  });

  // Profile/Password state (kept separate as they are user-specific, not global settings)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        // Merge with defaults to ensure colors object exists
        const fetchedSettings = response.data.data;
        if (!fetchedSettings.branding.colors) {
          fetchedSettings.branding.colors = {
            primary: '#06b5cc',
            secondary: '#11282b',
            accent: '#0d454e',
            background: '#111113'
          };
        }
        setSettings(fetchedSettings);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSettings(response.data.data);
        await refetchGlobalSettings();
        toast.success('Settings updated successfully');
        // Reload to apply branding changes immediately
        if (activeTab === 'branding') {
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    toast.info('Profile update not implemented in this demo');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.info('Password update not implemented in this demo');
  };

  const handlePolicyChange = (content) => {
    setSettings({
      ...settings,
      policies: {
        ...settings.policies,
        [activePolicy]: {
          ...settings.policies?.[activePolicy],
          content: content
        }
      }
    });
  };

  const tabs = [
    { id: 'branding', label: 'Branding & Colors', icon: Palette },
    { id: 'pages', label: 'Pages Content', icon: FileText },
    { id: 'footer', label: 'Footer', icon: Globe },
    { id: 'policies', label: 'Legal Policies', icon: Shield },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 text-[#06b5cc] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Settings</h1>
          <p className="text-sm text-gray-600">Manage platform branding and your account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#111113] border border-white/10 rounded-xl p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeTab === tab.id
                      ? 'bg-[#06b5cc] text-white font-medium shadow-lg'
                      : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-[#111113] border border-white/10 rounded-xl p-6">

              {/* BRANDING TAB */}
              {activeTab === 'branding' && (
                <form onSubmit={handleSettingsUpdate} className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-6">Platform Branding</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Platform Name</label>
                        <input
                          type="text"
                          value={settings.branding?.platformName || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: { ...settings.branding, platformName: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                          placeholder="e.g. My Platform"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Tagline</label>
                        <input
                          type="text"
                          value={settings.branding?.tagline || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: { ...settings.branding, tagline: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                          placeholder="e.g. Learn Excellence"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Logo URL</label>
                        <input
                          type="text"
                          value={settings.branding?.logo || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: { ...settings.branding, logo: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Favicon URL</label>
                        <input
                          type="text"
                          value={settings.branding?.favicon || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: { ...settings.branding, favicon: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Currency Symbol</label>
                        <input
                          type="text"
                          value={settings.branding?.currency || 'USD'}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: { ...settings.branding, currency: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                          placeholder="e.g. USD, $, EGP"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-8">
                    <h2 className="text-xl font-bold text-white mb-6">Theme Colors</h2>
                    <p className="text-sm text-[#94A3B8] mb-6">Customize the look and feel of your platform. These colors affect the loading screen and other elements.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Primary Color */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-white flex justify-between">
                          Primary Color
                          <span className="text-xs text-[#94A3B8] font-mono">{settings.branding?.colors?.primary || '#06b5cc'}</span>
                        </label>
                        <div className="flex gap-4 items-center">
                          <input
                            type="color"
                            value={settings.branding?.colors?.primary || '#06b5cc'}
                            onChange={(e) => setSettings({
                              ...settings,
                              branding: {
                                ...settings.branding,
                                colors: { ...settings.branding.colors, primary: e.target.value }
                              }
                            })}
                            className="h-12 w-24 rounded cursor-pointer bg-transparent"
                          />
                        </div>
                      </div>

                      {/* Secondary Color */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-white flex justify-between">
                          Secondary Color
                          <span className="text-xs text-[#94A3B8] font-mono">{settings.branding?.colors?.secondary || '#11282b'}</span>
                        </label>
                        <div className="flex gap-4 items-center">
                          <input
                            type="color"
                            value={settings.branding?.colors?.secondary || '#11282b'}
                            onChange={(e) => setSettings({
                              ...settings,
                              branding: {
                                ...settings.branding,
                                colors: { ...settings.branding.colors, secondary: e.target.value }
                              }
                            })}
                            className="h-12 w-24 rounded cursor-pointer bg-transparent"
                          />
                        </div>
                      </div>

                      {/* Accent Color */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-white flex justify-between">
                          Accent Color
                          <span className="text-xs text-[#94A3B8] font-mono">{settings.branding?.colors?.accent || '#0d454e'}</span>
                        </label>
                        <div className="flex gap-4 items-center">
                          <input
                            type="color"
                            value={settings.branding?.colors?.accent || '#0d454e'}
                            onChange={(e) => setSettings({
                              ...settings,
                              branding: {
                                ...settings.branding,
                                colors: { ...settings.branding.colors, accent: e.target.value }
                              }
                            })}
                            className="h-12 w-24 rounded cursor-pointer bg-transparent"
                          />
                        </div>
                      </div>

                      {/* Background Color */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-white flex justify-between">
                          Background Color
                          <span className="text-xs text-[#94A3B8] font-mono">{settings.branding?.colors?.background || '#111113'}</span>
                        </label>
                        <div className="flex gap-4 items-center">
                          <input
                            type="color"
                            value={settings.branding?.colors?.background || '#111113'}
                            onChange={(e) => setSettings({
                              ...settings,
                              branding: {
                                ...settings.branding,
                                colors: { ...settings.branding.colors, background: e.target.value }
                              }
                            })}
                            className="h-12 w-24 rounded cursor-pointer bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#06b5cc] hover:bg-[#06b5cc]/80 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Branding Settings
                    </button>
                  </div>
                </form>
              )}

              {/* PAGES CONTENT TAB */}
              {activeTab === 'pages' && (
                <form onSubmit={handleSettingsUpdate} className="space-y-8">

                  {/* Contact Section */}
                  <div>
                    <h2 className="text-xl font-bold text-white mb-6">Contact Page Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Support Email</label>
                        <input
                          type="email"
                          value={settings.contact?.supportEmail || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            contact: { ...settings.contact, supportEmail: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Phone Number</label>
                        <input
                          type="text"
                          value={settings.contact?.phone || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            contact: { ...settings.contact, phone: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Address</label>
                        <input
                          type="text"
                          value={settings.contact?.address || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            contact: { ...settings.contact, address: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-8">
                    <h2 className="text-xl font-bold text-white mb-6">About Page Info</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#94A3B8]">Main Title</label>
                          <input
                            type="text"
                            value={settings.about?.title || ''}
                            onChange={(e) => setSettings({
                              ...settings,
                              about: { ...settings.about, title: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#94A3B8]">Subtitle</label>
                          <input
                            type="text"
                            value={settings.about?.subtitle || ''}
                            onChange={(e) => setSettings({
                              ...settings,
                              about: { ...settings.about, subtitle: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Who We Are (Description)</label>
                        <textarea
                          rows={4}
                          value={settings.about?.whoWeAre || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            about: { ...settings.about, whoWeAre: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">What We Offer (Description)</label>
                        <textarea
                          rows={4}
                          value={settings.about?.whatWeOffer || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            about: { ...settings.about, whatWeOffer: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-8">
                    <h2 className="text-xl font-bold text-white mb-6">Sample Content Page</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Page Title</label>
                        <input
                          type="text"
                          value={settings.sampleContent?.title || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            sampleContent: { ...settings.sampleContent, title: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Description</label>
                        <input
                          type="text"
                          value={settings.sampleContent?.description || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            sampleContent: { ...settings.sampleContent, description: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-8">
                    <h2 className="text-xl font-bold text-white mb-6">Support Page</h2>

                    {/* Main Support Info */}
                    <div className="mb-8 space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Page Title</label>
                        <input
                          type="text"
                          value={settings.support?.title || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            support: { ...settings.support, title: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Description</label>
                        <textarea
                          rows={3}
                          value={settings.support?.description || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            support: { ...settings.support, description: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                      <div className="border-t border-white/10 pt-6 my-6">
                        <p className="text-sm text-[#94A3B8] bg-[#06b5cc]/10 p-4 rounded-lg border border-[#06b5cc]/20">
                          <strong>Note:</strong> You can add all your support channels (Email, Phone, Social Media links) using the <strong>Contact Categories</strong> below. This allows you to fully customize how they appear on the Support Page.
                        </p>
                      </div>
                    </div>

                    {/* Contact Categories */}
                    <div className="border-t border-white/10 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Contact Information Categories</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newCategories = [...(settings.support?.categories || []), { title: 'New Category', description: '' }];
                            setSettings({
                              ...settings,
                              support: { ...settings.support, categories: newCategories }
                            });
                          }}
                          className="text-xs px-3 py-1.5 bg-[#06b5cc]/20 text-[#06b5cc] rounded hover:bg-[#06b5cc]/30 transition-colors"
                        >
                          + Add Category
                        </button>
                      </div>

                      <div className="space-y-4">
                        {settings.support?.categories?.length === 0 && (
                          <p className="text-sm text-[#94A3B8] italic">No contact categories added yet.</p>
                        )}
                        {settings.support?.categories?.map((category, index) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 relative group">
                            <button
                              type="button"
                              onClick={() => {
                                const newCategories = settings.support.categories.filter((_, i) => i !== index);
                                setSettings({
                                  ...settings,
                                  support: { ...settings.support, categories: newCategories }
                                });
                              }}
                              className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 p-1 rounded"
                            >
                              <span className="sr-only">Remove</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-[#94A3B8]">Category Title</label>
                                <input
                                  type="text"
                                  value={category.title}
                                  onChange={(e) => {
                                    const newCategories = [...settings.support.categories];
                                    newCategories[index].title = e.target.value;
                                    setSettings({
                                      ...settings,
                                      support: { ...settings.support, categories: newCategories }
                                    });
                                  }}
                                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded text-sm text-white focus:border-[#06b5cc] focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-[#94A3B8]">Description / Details</label>
                                <input
                                  type="text"
                                  value={category.description}
                                  onChange={(e) => {
                                    const newCategories = [...settings.support.categories];
                                    newCategories[index].description = e.target.value;
                                    setSettings({
                                      ...settings,
                                      support: { ...settings.support, categories: newCategories }
                                    });
                                  }}
                                  placeholder="e.g. For sales inquiries..."
                                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded text-sm text-white focus:border-[#06b5cc] focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-8">
                    <h2 className="text-xl font-bold text-white mb-6">Pricing Page</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Page Title</label>
                        <input
                          type="text"
                          value={settings.pricingPage?.title || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            pricingPage: { ...settings.pricingPage, title: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Description</label>
                        <input
                          type="text"
                          value={settings.pricingPage?.description || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            pricingPage: { ...settings.pricingPage, description: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#06b5cc] hover:bg-[#06b5cc]/80 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Page Content
                    </button>
                  </div>
                </form>
              )}

              {/* FOOTER TAB */}
              {activeTab === 'footer' && (
                <form onSubmit={handleSettingsUpdate} className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-6">Footer Settings</h2>
                    <p className="text-sm text-[#94A3B8] mb-6">Manage the tagline and copyright text displayed in the website footer.</p>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Footer Tagline</label>
                        <input
                          type="text"
                          value={settings.footer?.tagline || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            footer: { ...settings.footer, tagline: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                          placeholder="e.g. Learn excellence and confidence"
                        />
                        <p className="text-xs text-[#64748B]">Appears below the logo in the footer.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94A3B8]">Copyright Text</label>
                        <input
                          type="text"
                          value={settings.footer?.copyrightText || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            footer: { ...settings.footer, copyrightText: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#06b5cc] focus:outline-none"
                          placeholder="e.g. My Platform. All rights reserved."
                        />
                        <p className="text-xs text-[#64748B]">Appears at the very bottom of the footer. © Year will be added automatically.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#06b5cc] hover:bg-[#06b5cc]/80 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Footer Settings
                    </button>
                  </div>
                </form>
              )}

              {/* POLICIES TAB (LEGAL) */}
              {activeTab === 'policies' && (
                <form onSubmit={handleSettingsUpdate} className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white">Legal Policies</h2>
                      <div className="flex gap-2">
                        <select
                          value={activePolicy}
                          onChange={(e) => setActivePolicy(e.target.value)}
                          className="bg-[#18181B] text-white border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#06b5cc]"
                        >
                          <option value="privacyPolicy">Privacy Policy</option>
                          <option value="termsOfService">Terms of Service</option>
                          <option value="refundPolicy">Refund Policy</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <RichTextEditor
                        value={settings.policies?.[activePolicy]?.content || ''}
                        onChange={handlePolicyChange}
                        placeholder={`Start writing your ${activePolicy.replace(/([A-Z])/g, ' $1').trim()}...`}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#06b5cc] hover:bg-[#06b5cc]/80 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Policy Content
                    </button>
                  </div>
                </form>
              )}

              {/* PROFILE TAB (Simplified) */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Name</label>
                      <input type="text" value={profileData.name} readOnly className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white opacity-60" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email</label>
                      <input type="email" value={profileData.email} readOnly className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white opacity-60" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Role</label>
                      <input type="text" value={user?.role || 'admin'} disabled className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#94A3B8] opacity-60" />
                    </div>
                  </form>
                </div>
              )}

              {/* PASSWORD TAB (Simplified) */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
                  <p className="text-[#94A3B8]">Password management is controlled by the system administrator.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

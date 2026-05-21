import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../config/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';

/** Dedicated Contact Us page (form moved from the landing page). */
function Contact() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState('idle');
  const [contactFeedback, setContactFeedback] = useState('');

  const handleContactChange = (e) =>
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });

  const handleContactSubmit = async () => {
    setContactStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setContactStatus('success');
        setContactFeedback(data.message || 'Message sent successfully.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setContactStatus('error');
        setContactFeedback(data.error || 'Something went wrong.');
      }
    } catch {
      setContactStatus('error');
      setContactFeedback('Could not connect to the server.');
    }
  };

  const contactInfo = [
    { label: 'Email Us', value: 'support@kdreammerce.com', accent: 'text-blue-400', border: 'border-blue-400/20', bg: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Call Us', value: '+63 912 345 6789', accent: 'text-purple-400', border: 'border-purple-400/20', bg: 'from-purple-500/10 to-purple-500/5' },
    { label: 'Find Us', value: 'Consolacion, Cebu, Philippines', accent: 'text-pink-400', border: 'border-pink-400/20', bg: 'from-pink-500/10 to-pink-500/5' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <section className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Got questions about an order or listing? We&apos;d love to hear from you.
          </p>
        </section>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 p-8 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl">
            <h2 className="text-white text-2xl font-bold mb-1">Send us a message</h2>
            <p className="text-gray-500 text-sm mb-7">We&apos;ll get back to you within 24 hours.</p>

            {contactStatus === 'success' ? (
              <div className="py-12 text-center">
                <p className="text-white font-semibold text-lg mb-1">Message sent!</p>
                <p className="text-gray-400 text-sm mb-6">{contactFeedback}</p>
                <button type="button" onClick={() => setContactStatus('idle')} className="text-purple-400 text-sm underline">
                  Send another message
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="text" name="name" value={contactForm.name} onChange={handleContactChange} placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                  <input type="email" name="email" value={contactForm.email} onChange={handleContactChange} placeholder="Your email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                </div>
                <input type="text" name="subject" value={contactForm.subject} onChange={handleContactChange} placeholder="Subject" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                <textarea rows={5} name="message" value={contactForm.message} onChange={handleContactChange} placeholder="Your message" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none" />
                {contactStatus === 'error' && <p className="text-pink-400 text-sm">{contactFeedback}</p>}
                <button type="button" onClick={handleContactSubmit} disabled={contactStatus === 'loading'} className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 disabled:opacity-50">
                  {contactStatus === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {contactInfo.map((item) => (
              <div key={item.label} className={`p-4 bg-gradient-to-r ${item.bg} border ${item.border} rounded-2xl`}>
                <p className="text-gray-500 text-xs uppercase tracking-widest">{item.label}</p>
                <p className={`${item.accent} text-sm font-medium mt-1`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center mt-12">
          <Link to="/" className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Contact;

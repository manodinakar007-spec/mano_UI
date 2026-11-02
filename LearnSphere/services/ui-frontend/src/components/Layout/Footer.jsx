import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Github, Twitter, Linkedin, Mail, ArrowRight, CheckCircle } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Course Catalog', to: '/courses' },
    { label: 'Learning Paths', to: '/learning-paths' },
    { label: 'Live Sessions', to: '/live-sessions' },
    { label: 'My Dashboard', to: '/dashboard' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'API Status', href: '#' },
    { label: 'Community', href: '#' },
  ],
};

const SOCIALS = [
  { icon: Github, href: 'https://github.com/skillfyme', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com/skillfyme', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/skillfyme', label: 'LinkedIn' },
];

const LEGAL = ['Privacy Policy', 'Terms of Service', 'Cookie Policy'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subState, setSubState] = useState('idle'); // idle | error | success

  function handleSubscribe() {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) { setSubState('error'); return; }
    setSubState('success');
    setEmail('');
  }

  return (
    <footer className="bg-gray-950 text-gray-400">

      {/* Newsletter strip */}
      <div className="border-b border-gray-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Stay in the loop</h3>
              <p className="text-sm text-gray-500">Get the latest courses and learning tips in your inbox.</p>
            </div>
            {subState === 'success' ? (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-5 py-3 text-sm font-medium">
                <CheckCircle className="h-4 w-4 shrink-0" />
                You're subscribed! Check your inbox.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setSubState('idle'); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                      placeholder="you@company.com"
                      className={`w-full bg-gray-900 border text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none transition-colors ${
                        subState === 'error'
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500/30'
                          : 'border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30'
                      }`}
                    />
                  </div>
                  <button
                    onClick={handleSubscribe}
                    className="btn-primary text-sm px-4 whitespace-nowrap flex items-center gap-1.5"
                  >
                    Subscribe <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {subState === 'error' && (
                  <p className="text-xs text-red-400 pl-1">Please enter a valid email address.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_4px_14px_rgba(59,130,246,0.45)]">
                <Cloud className="h-5 w-5 text-white fill-white" strokeWidth={0} />
              </div>
              <span className="text-[1.35rem] font-extrabold tracking-tight text-blue-400">
                Skillfyme
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
              The enterprise learning platform for modern teams. Upskill faster with personalized paths, live mentoring, and AI-powered assessments.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 hover:bg-gray-800 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4">{heading}</h4>
              <ul className="space-y-3">
                {links.map(({ label, to, href }) => (
                  <li key={label}>
                    {to ? (
                      <Link to={to} className="text-sm text-gray-500 hover:text-white transition-colors duration-200">
                        {label}
                      </Link>
                    ) : (
                      <a href={href} className="text-sm text-gray-500 hover:text-white transition-colors duration-200">
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-gray-800/60 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Skillfyme, Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            {LEGAL.map((label) => (
              <a key={label} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors duration-200">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

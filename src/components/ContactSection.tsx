import React, { useState } from 'react';
import {
  ArrowUpRight,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import { ProfileData } from '../types/portfolio';

interface ContactSectionProps {
  profile: ProfileData;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
  const [notice, setNotice] = useState<string | null>(null);

  const showEmail = profile.showEmail !== false;
  const showWhatsapp = profile.showWhatsapp !== false;
  const showLinkedin = profile.showLinkedin !== false;
  const showBehance = profile.showBehance !== false;

  const hasEmail = Boolean(profile.email && profile.email.trim());
  const hasWhatsapp = Boolean(profile.whatsapp && profile.whatsapp.trim());
  const hasLinkedin = Boolean(profile.linkedin && profile.linkedin.trim());
  const hasBehance = Boolean(profile.behance && profile.behance.trim());

  const formatWhatsappHref = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const digits = trimmed.replace(/[^0-9]/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  };

  const formatUrl = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

  const handleUnconfigured = (label: string) => {
    setNotice(
      `${label} link is currently an editable placeholder. The portfolio owner can set the live ${label} address in the Admin Dashboard.`
    );
  };

  const anyVisibleChannel = showEmail || showWhatsapp || showLinkedin || showBehance;

  return (
    <section id="contact" className="bg-[#F7F8FA]">
      <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Heading & Location */}
          <div className={anyVisibleChannel ? 'lg:col-span-5' : 'lg:col-span-12 max-w-xl'}>
            <p className="text-xs font-semibold tracking-wider uppercase text-[#315E9B] mb-2">
              Contact &amp; Inquiries
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#202124] tracking-tight mb-4">
              Let&apos;s Work Together
            </h2>
            <p className="text-base text-[#6B7280] leading-relaxed mb-8">
              Have a project, professional opportunity, or creative collaboration in mind? Feel
              free to get in touch.
            </p>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#315E9B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#6B7280]">Based In</p>
                  <p className="text-sm font-semibold text-[#202124]">{profile.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Contact Channels */}
          {anyVisibleChannel && (
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {showEmail && (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center text-[#315E9B] mb-4">
                        <Mail className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-base font-bold text-[#202124] mb-1">
                        Email Address
                      </h3>
                      <p className="text-sm text-[#6B7280] break-all mb-5">
                        {hasEmail ? profile.email : 'Editable placeholder · Set in Admin CMS'}
                      </p>
                    </div>
                    {hasEmail ? (
                      <a
                        href={`mailto:${profile.email}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors"
                      >
                        <span>Send Email</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnconfigured('Email Address')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
                      >
                        <span>Send Email</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {showWhatsapp && (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center text-[#315E9B] mb-4">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-base font-bold text-[#202124] mb-1">
                        WhatsApp
                      </h3>
                      <p className="text-sm text-[#6B7280] break-all mb-5">
                        {hasWhatsapp ? profile.whatsapp : 'Editable placeholder · Set in Admin CMS'}
                      </p>
                    </div>
                    {hasWhatsapp ? (
                      <a
                        href={formatWhatsappHref(profile.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg transition-colors"
                      >
                        <span>WhatsApp Message</span>
                        <ExternalLink className="w-4 h-4 text-[#315E9B]" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnconfigured('WhatsApp')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
                      >
                        <span>WhatsApp Message</span>
                        <ExternalLink className="w-4 h-4 text-[#315E9B]" />
                      </button>
                    )}
                  </div>
                )}

                {showLinkedin && (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center text-[#315E9B] font-display font-bold text-sm mb-4">
                        in
                      </div>
                      <h3 className="font-display text-base font-bold text-[#202124] mb-1">
                        LinkedIn
                      </h3>
                      <p className="text-sm text-[#6B7280] break-all mb-5">
                        {hasLinkedin ? profile.linkedin : 'Editable placeholder · Set in Admin CMS'}
                      </p>
                    </div>
                    {hasLinkedin ? (
                      <a
                        href={formatUrl(profile.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg transition-colors"
                      >
                        <span>Visit LinkedIn</span>
                        <ExternalLink className="w-4 h-4 text-[#315E9B]" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnconfigured('LinkedIn')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
                      >
                        <span>Visit LinkedIn</span>
                        <ExternalLink className="w-4 h-4 text-[#315E9B]" />
                      </button>
                    )}
                  </div>
                )}

                {showBehance && (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center text-[#315E9B] font-display font-bold text-sm mb-4">
                        Bē
                      </div>
                      <h3 className="font-display text-base font-bold text-[#202124] mb-1">
                        Behance
                      </h3>
                      <p className="text-sm text-[#6B7280] break-all mb-5">
                        {hasBehance ? profile.behance : 'Editable placeholder · Set in Admin CMS'}
                      </p>
                    </div>
                    {hasBehance ? (
                      <a
                        href={formatUrl(profile.behance)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg transition-colors"
                      >
                        <span>View Behance</span>
                        <ExternalLink className="w-4 h-4 text-[#315E9B]" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnconfigured('Behance')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
                      >
                        <span>View Behance</span>
                        <ExternalLink className="w-4 h-4 text-[#315E9B]" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {notice && (
                <div
                  role="status"
                  className="bg-white border border-[#315E9B]/30 rounded-xl px-4 py-3 text-xs text-[#202124] flex items-center justify-between gap-4"
                >
                  <span>{notice}</span>
                  <button
                    type="button"
                    onClick={() => setNotice(null)}
                    className="text-xs font-semibold text-[#315E9B] hover:underline shrink-0 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

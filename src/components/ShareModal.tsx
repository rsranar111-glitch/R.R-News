import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Twitter, 
  Linkedin, 
  Send
} from 'lucide-react';
import { Article } from '../types/news.ts';
import { recordShare } from '../services/storage.ts';

interface ShareModalProps {
  article: Article | null;
  onClose: () => void;
  isOpen?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({ article, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (article) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [article]);

  if (!article) return null;

  const shareUrl = article.sourceUrl || window.location.href;
  const shareText = `Read "${article.title}" on R.R News`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    recordShare(article.id);
    setTimeout(() => setCopied(false), 2000);
  };

  const recordSocialShare = () => {
    recordShare(article.id);
  };

  const shareLinks = [
    {
      name: 'X (Twitter)',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: Send,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      
      <div className="bg-[#111726] backdrop-blur-2xl rounded-3xl max-w-sm w-full border border-white/10 shadow-2xl p-6 space-y-4 text-white">
        
        <div className="flex items-center justify-between">
          <h3 className="headline-font text-base font-bold text-white">
            Share Article
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <p className="headline-font text-xs font-semibold text-white line-clamp-2">
            {article?.title || ''}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {article?.source || ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {shareLinks.map(link => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordSocialShare()}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors font-medium cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{link.name}</span>
              </a>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};

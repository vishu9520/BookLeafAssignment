import React from 'react';
import { DollarSign, BookOpen, Printer, Globe, Clock, HelpCircle } from 'lucide-react';

const categoryIcons = {
  'Royalty & Payments': DollarSign,
  'ISBN & Metadata Issues': BookOpen,
  'Printing & Quality': Printer,
  'Distribution & Availability': Globe,
  'Book Status & Production Updates': Clock,
  'General Inquiry': HelpCircle
};

export default function CategoryBadge({ category = 'General Inquiry' }) {
  const Icon = categoryIcons[category] || HelpCircle;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
      <Icon className="w-3.5 h-3.5 text-slate-500" />
      <span>{category}</span>
    </span>
  );
}

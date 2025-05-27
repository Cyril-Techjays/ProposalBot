
"use client"; // Added "use client" as useRouter is a client hook

import React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, MessageCircle, Download, Clock, Users2, DollarSign, Icon as LucideIcon } from 'lucide-react'; // Import Home icon
import type { SummaryBadge } from '@/lib/types';

interface ProposalHeaderProps {
  title: string;
  clientName: string;
  projectType: string;
  summaryBadges: SummaryBadge[];
  onAIChatClick: () => void;
}

const iconMap: { [key: string]: LucideIcon } = {
  Clock: Clock,
  Users2: Users2,
  DollarSign: DollarSign,
  MessageCircle: MessageCircle,
  Download: Download,
};


export function ProposalHeader({ title, clientName, projectType, summaryBadges, onAIChatClick }: ProposalHeaderProps) {
  const router = useRouter(); // Initialize router

  const handleExportProposal = () => {
    // Placeholder for Export functionality
    alert("Export functionality coming soon!");
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <header className="bg-card border-b border-border/50 shadow-sm py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4"> {/* Wrapper for Home button and title */}
            <Button onClick={handleGoHome} variant="outline" size="icon" aria-label="Go to Home Page">
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Client: {clientName} | Project Type: {projectType}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {summaryBadges.map((badge, index) => {
                  const IconComponent = iconMap[badge.icon] || Clock; // Default to Clock if icon not found
                  return (
                    <Badge key={index} variant="secondary" className="text-xs sm:text-sm py-1 px-2.5">
                      <IconComponent className="h-3.5 w-3.5 mr-1.5" />
                      {badge.text}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0 flex-shrink-0 self-start sm:self-center"> {/* Adjusted self-alignment for buttons */}
            <Button onClick={onAIChatClick} className="bg-green-500 hover:bg-green-600 text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Chat
            </Button>
            <Button onClick={handleExportProposal} variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="h-4 w-4 mr-2" />
              Export Full Proposal
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

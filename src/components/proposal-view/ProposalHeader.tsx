import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Download, Clock, Users2, DollarSign, Icon as LucideIcon } from 'lucide-react';
import type { SummaryBadge } from '@/lib/types';

interface ProposalHeaderProps {
  title: string;
  clientName: string;
  projectType: string;
  summaryBadges: SummaryBadge[];
}

const iconMap: { [key: string]: LucideIcon } = {
  Clock: Clock,
  Users2: Users2,
  DollarSign: DollarSign,
  MessageCircle: MessageCircle,
  Download: Download,
};


export function ProposalHeader({ title, clientName, projectType, summaryBadges }: ProposalHeaderProps) {
  
  const handleAIChat = () => {
    // Placeholder for AI Chat functionality
    alert("AI Chat functionality coming soon!");
  };

  const handleExportProposal = () => {
    // Placeholder for Export functionality
    alert("Export functionality coming soon!");
  };

  return (
    <header className="bg-card border-b border-border/50 shadow-sm py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
          <div className="flex gap-3 mt-4 sm:mt-0 flex-shrink-0">
            <Button onClick={handleAIChat} className="bg-green-500 hover:bg-green-600 text-white">
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

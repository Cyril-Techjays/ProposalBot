
"use client"; 

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, MessageCircle, Download, Clock, Users2, DollarSign, Icon as LucideIcon } from 'lucide-react';
import type { SummaryBadge } from '@/lib/types';
import { PRINTABLE_CONTENT_ID } from './ProposalViewLayout'; // Import the ID
import { useToast } from '@/hooks/use-toast';


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
  const router = useRouter();
  const { toast } = useToast();

  const handleExportProposal = async () => {
    const elementToPrint = document.getElementById(PRINTABLE_CONTENT_ID);
    if (!elementToPrint) {
      console.error("Element to print not found:", PRINTABLE_CONTENT_ID);
      toast({
        title: "Export Error",
        description: "Could not find proposal content to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Dynamically import html2pdf.js
      const html2pdf = (await import('html2pdf.js')).default;
      
      const sanitizedFilename = title.replace(/[\s\\/]/g, '_') || 'Proposal'; // Basic sanitization

      const opt = {
        margin: 0.5, // inches
        filename: `${sanitizedFilename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2, // Improves text clarity
          useCORS: true, // Important for any external images
          logging: false, // Disables html2canvas console logs
           onclone: (document: Document) => {
            // This function is called after the DOM is cloned for printing.
            // You can apply print-specific styles here if needed.
            // For example, to ensure all content in scrollable areas is expanded:
            const scrollAreas = document.querySelectorAll('[data-radix-scroll-area-viewport]');
            scrollAreas.forEach(area => {
              (area as HTMLElement).style.height = 'auto';
              (area as HTMLElement).style.overflow = 'visible';
            });
          }
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as any[] }, // Helps with page breaking logic
      };

      toast({
        title: "Generating PDF...",
        description: "Your proposal is being converted to PDF. Please wait.",
      });

      await html2pdf().from(elementToPrint).set(opt).save();
      
      toast({
        title: "PDF Exported",
        description: `${opt.filename} has been downloaded.`,
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "An error occurred while exporting the proposal. Check the console for details.",
        variant: "destructive",
      });
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <header className="bg-card border-b border-border/50 shadow-sm py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4"> 
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
                  const IconComponent = iconMap[badge.icon] || Clock; 
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
          <div className="flex gap-3 mt-4 sm:mt-0 flex-shrink-0 self-start sm:self-center"> 
            <Button onClick={onAIChatClick} className="bg-primary hover:bg-primary/90 text-primary-foreground"> {/* Changed to primary as per theme */}
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

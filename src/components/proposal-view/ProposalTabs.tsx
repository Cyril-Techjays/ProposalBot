import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, ClipboardList, LayoutGrid, CalendarDays, Landmark, Users, Icon as LucideIcon } from 'lucide-react';
import type { ProposalSectionKey } from './ProposalViewLayout';

interface ProposalTabsProps {
  activeTab: ProposalSectionKey;
  onTabChange: (tab: ProposalSectionKey) => void;
}

const tabConfig: { key: ProposalSectionKey; label: string; icon: LucideIcon }[] = [
  { key: 'executiveSummary', label: 'Executive Summary', icon: Briefcase },
  { key: 'requirementsAnalysis', label: 'Requirements Analysis', icon: ClipboardList },
  { key: 'featureBreakdown', label: 'Feature Breakdown', icon: LayoutGrid },
  { key: 'projectTimelineSection', label: 'Project Timeline', icon: CalendarDays },
  { key: 'budgetAndInvestmentSection', label: 'Budget & Investment', icon: Landmark },
  { key: 'teamAndResources', label: 'Team & Resources', icon: Users },
];

export function ProposalTabs({ activeTab, onTabChange }: ProposalTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ProposalSectionKey)} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 h-auto p-1">
        {tabConfig.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className="flex-col sm:flex-row justify-start sm:justify-center items-center gap-1.5 sm:gap-2 px-3 py-2.5 h-auto text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

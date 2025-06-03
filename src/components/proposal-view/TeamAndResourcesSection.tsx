"use client";

import React from 'react';
import type { TeamAndResources, IndividualTeamMemberAllocation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Users, Briefcase, Clock, Percent } from 'lucide-react'; // Added icons

interface TeamAndResourcesSectionProps {
  data: TeamAndResources;
}

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-border/50 last:border-b-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export function TeamAndResourcesSection({ data }: TeamAndResourcesSectionProps) {
  if (!data || !data.teamMembers || data.teamMembers.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-foreground tracking-tight">Project Team & Resources</h2>
        <p className="text-muted-foreground">Team information will appear here once generated.</p>
        <p className="text-muted-foreground mt-4">No team members available to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-foreground tracking-tight">{data.sectionTitle || "Project Team & Resources"}</h2>

      <div className="space-y-6">
        {data.teamMembers.map((member: IndividualTeamMemberAllocation, index) => (
          <Card key={`member-${index}-${member.id}`} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium text-primary flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {member.roleName} ({member.seniority})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-1 mb-4">
                <DetailItem label="Total Hours" value={member.totalHours} />
                <DetailItem label="Duration" value={member.duration} />
                <DetailItem label="Utilization" value={member.utilization} />
              </div>

              {member.responsibilities && member.responsibilities.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-foreground mb-2">Responsibilities:</h4>
                  <ul className="space-y-1">
                    {member.responsibilities.map((responsibility, rIndex) => (
                      <li key={`resp-${index}-${rIndex}`} className="flex items-start text-sm text-muted-foreground">
                        <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {!member.responsibilities || member.responsibilities.length === 0 && (
                  <p className="text-sm text-muted-foreground">No specific responsibilities listed for this team member.</p>
               )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

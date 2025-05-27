
"use client";

import React from 'react';
import type { TeamAndResources, RoleAllocation, RoleResponsibilities } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Users, Briefcase, Clock, Percent } from 'lucide-react'; // Added icons

interface TeamAndResourcesSectionProps {
  data: TeamAndResources;
}

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-border/50">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export function TeamAndResourcesSection({ data }: TeamAndResourcesSectionProps) {
  if (!data || (!data.teamAllocations?.length && !data.teamStructure?.length)) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-foreground tracking-tight">Team & Resources</h2>
        <p className="text-muted-foreground">Team allocation and responsibilities will appear here once generated.</p>
        <p className="text-muted-foreground mt-4">No team information available to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Team Allocation & Resource Planning Section */}
      {data.teamAllocations && data.teamAllocations.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4 tracking-tight">
            {data.teamAllocationTitle || "Team Allocation & Resource Planning"}
          </h2>
          <div className="space-y-6">
            {data.teamAllocations.map((allocation, index) => (
              <Card key={`alloc-${index}-${allocation.roleName}`} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-medium text-primary flex items-center">
                    <Users className="h-5 w-5 mr-2" /> 
                    {allocation.roleName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-1">
                    <DetailItem label="Total Hours" value={allocation.totalHours} />
                    <DetailItem label="Duration" value={allocation.duration} />
                    <DetailItem label="Utilization" value={allocation.utilization} />
                    {/* Hourly Rate and Total Cost are intentionally omitted as per requirements */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Team Structure & Responsibilities Section */}
      {data.teamStructure && data.teamStructure.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4 tracking-tight">
            {data.teamStructureTitle || "Team Structure & Responsibilities"}
          </h2>
          <div className="space-y-6">
            {data.teamStructure.map((structure, index) => (
              <Card key={`struct-${index}-${structure.roleName}`} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-medium text-primary flex items-center">
                     <Briefcase className="h-5 w-5 mr-2" />
                    {structure.roleName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {structure.responsibilities && structure.responsibilities.length > 0 ? (
                    <ul className="space-y-2">
                      {structure.responsibilities.map((responsibility, rIndex) => (
                        <li key={`resp-${index}-${rIndex}`} className="flex items-start text-sm text-muted-foreground">
                          <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific responsibilities listed for this role.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

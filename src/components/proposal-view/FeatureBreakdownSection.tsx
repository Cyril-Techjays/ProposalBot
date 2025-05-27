
"use client";

import React from 'react';
import type { FeatureBreakdown, FeatureItem, ResourceAllocationItem, Tag } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertTriangle, ShieldCheck, Zap, TrendingUp, Settings2, ListChecks, Users, Clock } from 'lucide-react';

interface FeatureBreakdownSectionProps {
  data: FeatureBreakdown;
}

const getTagVariant = (colorScheme: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
  switch (colorScheme?.toLowerCase()) {
    case 'red':
      return 'destructive';
    case 'blue': // Using primary for blue as an example
      return 'default';
    case 'green': // Using secondary for green-like
      return 'secondary';
    case 'gray':
      return 'outline';
    default:
      return 'secondary'; // Default to secondary for other colors
  }
};

const getListIcon = (type: 'functional' | 'non-functional') => {
  return type === 'functional' ? 
    <CheckCircle2 className="h-4 w-4 text-sky-600 mr-2 mt-0.5 flex-shrink-0" /> : 
    <ShieldCheck className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />;
};


export function FeatureBreakdownSection({ data }: FeatureBreakdownSectionProps) {
  if (!data || !data.features || data.features.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-foreground tracking-tight">{data?.title || "Detailed Feature Breakdown"}</h2>
        <p className="text-muted-foreground">{data?.subtitle || "Feature analysis will appear here once generated."}</p>
        <p className="text-muted-foreground mt-4">No features available to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-foreground tracking-tight">{data.title}</h2>
        <p className="text-muted-foreground">{data.subtitle}</p>
      </div>

      <div className="space-y-6">
        {data.features.map((feature) => (
          <Card key={feature.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle className="text-xl font-semibold text-primary mb-1 sm:mb-0">{feature.title}</CardTitle>
                {feature.totalHours && (
                  <Badge variant="outline" className="text-sm py-1 px-2.5 border-primary text-primary whitespace-nowrap">
                    <Clock className="h-4 w-4 mr-1.5" /> Est. {feature.totalHours}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground pt-1">{feature.description}</p>
              {feature.tags && feature.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {feature.tags.map((tag) => (
                    <Badge key={tag.text} variant={getTagVariant(tag.colorScheme)} className="text-xs">
                      {tag.text}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {feature.functionalFeatures && feature.functionalFeatures.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-foreground mb-1.5">Functional Features:</h4>
                  <ul className="space-y-1 pl-1">
                    {feature.functionalFeatures.map((item, index) => (
                      <li key={`func-${feature.id}-${index}`} className="flex items-start text-sm text-muted-foreground">
                        {getListIcon('functional')}
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feature.nonFunctionalRequirements && feature.nonFunctionalRequirements.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-foreground mb-1.5">Non-Functional Requirements:</h4>
                  <ul className="space-y-1 pl-1">
                    {feature.nonFunctionalRequirements.map((item, index) => (
                      <li key={`nonfunc-${feature.id}-${index}`} className="flex items-start text-sm text-muted-foreground">
                        {getListIcon('non-functional')}
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feature.resourceAllocation && feature.resourceAllocation.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-foreground mb-2">Resource Allocation (Time Estimates):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {feature.resourceAllocation.map((res, index) => (
                      <div key={`res-${feature.id}-${index}`} className="p-3 bg-muted/40 rounded-md border border-dashed">
                        <p className="text-sm font-medium text-foreground">{res.role}</p>
                        <p className="text-xs text-muted-foreground">Est. {res.hours}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

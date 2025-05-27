
import React from 'react';
import type { StructuredProposal } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExecutiveSummarySectionProps {
  data: StructuredProposal['executiveSummary'];
}

const colorMap: { [key: string]: string } = {
  blue: 'bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700',
  green: 'bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-700',
  purple: 'bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-700',
  orange: 'bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-700',
  default: 'bg-muted/50 border-border',
};


export function ExecutiveSummarySection({ data }: ExecutiveSummarySectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-3">Executive Summary</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {data.summaryText}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.highlights.map((highlight, index) => {
            const bgColor = colorMap[highlight.colorName] || colorMap.default;
            return (
                 <Card key={index} className={`shadow-sm ${bgColor}`}>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-1">{highlight.label}</p>
                        <p className="text-2xl font-bold text-foreground">{highlight.value}</p>
                    </CardContent>
                </Card>
            )
        })}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Project Goals & Objectives</h3>
        <ul className="space-y-4">
          {data.projectGoals.map((goal, index) => (
            <li key={goal.id} className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm mr-4">
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium text-foreground">{goal.title}</h4>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

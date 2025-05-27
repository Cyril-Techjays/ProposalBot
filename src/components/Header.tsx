import { FileText } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <FileText className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-2xl font-semibold text-foreground">
          ProposalCraft <span className="text-primary">AI</span>
        </h1>
      </div>
    </header>
  );
}

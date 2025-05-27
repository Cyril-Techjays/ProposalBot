export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} ProposalCraft AI. All rights reserved.
      </div>
    </footer>
  );
}

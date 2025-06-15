
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, FileText, Bot } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary font-headline">ExpoStand Pro</h1>
        <p className="text-xl text-foreground/80 mt-2">
          Your Ultimate Solution for Exhibition Stand Quotations & Invoices
        </p>
      </header>

      <main className="grid md:grid-cols-3 gap-8 max-w-4xl w-full mb-12">
        <FeatureCard
          icon={<FileText className="w-12 h-12 text-accent" />}
          title="Effortless Quotations"
          description="Generate professional quotations for various stand types with automated calculations."
        />
        <FeatureCard
          icon={<Rocket className="w-12 h-12 text-accent" />}
          title="Seamless Invoicing"
          description="Automatically create invoices when quotations are won, streamlining your workflow."
        />
        <FeatureCard
          icon={<Bot className="w-12 h-12 text-accent" />}
          title="AI-Powered Suggestions"
          description="Get intelligent stand configuration recommendations based on client needs and budget."
        />
      </main>

      <Link href="/dashboard">
        <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 px-6 rounded-lg shadow-lg transition-transform hover:scale-105">
          Go to Dashboard
        </Button>
      </Link>

      <footer className="mt-16 text-center text-foreground/60">
        <p>&copy; 2025 ExpoStand Pro (Sales Management Systems) - Alain BERTRAND All rights reserved.</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="items-center">
        {icon}
        <CardTitle className="text-2xl font-headline text-primary mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center text-foreground/70">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

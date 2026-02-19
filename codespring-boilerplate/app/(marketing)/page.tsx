/**
 * Marketing Homepage — PRD 01 (DevOps Launchpad)
 * Value proposition, free preview CTA, unlock full course (Stripe/pricing), SEO, analytics.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FlaskConical, GitBranch, Layers, Route } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { HomeHeroCtas } from "@/components/landing/home-hero-ctas";

export const metadata: Metadata = {
  title: "DevOps Launchpad — Practical DevOps Training for Beginners",
  description:
    "Build real skills with guided labs in Git, Docker, Kubernetes, Helm Charts, Terraform, Ansible, CI/CD, and Cloud Basics. Launch your DevOps career with hands-on training.",
  openGraph: {
    title: "DevOps Launchpad — Practical DevOps Training for Beginners",
    description:
      "Build real skills with guided labs in Git, Docker, Kubernetes, Helm Charts, Terraform, Ansible, CI/CD, and Cloud Basics.",
    type: "website",
  },
};

const valueProps = [
  {
    title: "Hands-on labs",
    description: "Practice in real environments, not just theory. Run commands, build pipelines, deploy to cloud.",
    icon: FlaskConical,
  },
  {
    title: "Real-world Projects",
    description: "Apply Git, Docker, Kubernetes, Terraform, and CI/CD in project-based labs that mirror industry workflows.",
    icon: GitBranch,
  },
  {
    title: "Structured path",
    description: "From basics to deployment in a clear, step-by-step curriculum. No guesswork.",
    icon: Route,
  },
  {
    title: "Track progress",
    description: "See what you’ve completed and what’s next. Pick up where you left off.",
    icon: Layers,
  },
];

const howItWorksSteps = [
  "Start free — Sign up and start the free preview. No credit card required.",
  "Learn by doing — Complete guided labs at your own pace. Practice in real environments.",
  "Unlock when ready — Get full access to all modules, projects, and updates.",
  "Lifetime access — One-time purchase includes future course updates and support.",
  "Apply it — Use your skills in real projects and interviews.",
];

const faqs = [
  {
    q: "What’s included in the free preview?",
    a: "You get access to one course introduction video so you can see the format and content before buying.",
  },
  {
    q: "How do I unlock the full course?",
    a: "Click “Unlock Full Course” to go to pricing and complete checkout. You’ll get immediate access after payment.",
  },
  {
    q: "Do I need prior DevOps experience?",
    a: "No. The course is designed for beginners and people transitioning into DevOps from development or IT.",
  },
  {
    q: "What if I get stuck?",
    a: "Each lesson includes clear instructions and hints. Support is available for enrolled students.",
  },
  {
    q: "Is there a refund policy?",
    a: "Yes. We offer a 30-day money-back guarantee if the course isn’t right for you.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="py-16 md:py-24 px-4 md:px-6 relative bg-gradient-to-b from-background to-muted/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5OTk5OTkiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNi02aDZ2LTZoLTZ2NnptLTEyIDEyaDZ2LTZoLTZ2NnptLTYtNmg2di02aC02djZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50 mix-blend-soft-light pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Launch your DevOps career with hands-on training
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn Git, Docker, Kubernetes, Helm Charts, Ansible, CI/CD, Terraform, and Cloud basics with guided, real-world exercises.
          </p>
          <HomeHeroCtas />
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required for preview · Join thousands of learners
          </p>
        </div>
      </section>

      {/* Value Props / Features */}
      <section className="py-20 md:py-24 px-4 md:px-6 border-t border-border/80 bg-muted/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-sm font-medium uppercase tracking-wider text-primary mb-3">
              Why DevOps Launchpad
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              Built for how you learn
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Practical, project-driven training that gets you job-ready.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {valueProps.map(({ title, description, icon: Icon }, i) => (
              <Card
                key={title}
                className="group relative border border-border/80 bg-card rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 group-hover:bg-primary/15 group-hover:ring-primary/20 transition-colors duration-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-mono font-medium text-muted-foreground tabular-nums">
                      0{i + 1}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-semibold tracking-tight mt-4">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-muted/20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            What learners say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Finally a course that lets me actually do the work, not just watch.",
                name: "Alex T.",
                role: "DevOps Engineer",
              },
              {
                quote: "The Terraform and Kubernetes sections got me production-ready in weeks.",
                name: "Jordan M.",
                role: "Platform Engineer",
              },
              {
                quote: "Clear path from zero to deploying real apps. Worth every penny.",
                name: "Sam K.",
                role: "Backend Developer",
              },
            ].map((t) => (
              <Card key={t.name} className="bg-card/80">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-background">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How it works
          </h2>
          <ol className="space-y-6">
            {howItWorksSteps.map((step, i) => {
              const [title, rest] = step.includes(" — ") ? step.split(" — ") : [null, step];
              return (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground pt-0.5">
                    {title ? (
                      <>
                        <span className="font-medium text-foreground">{title}</span>
                        {" — "}
                        {rest}
                      </>
                    ) : (
                      step
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-background">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-border/50 border-t py-12 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} DevOps Launchpad. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/support"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

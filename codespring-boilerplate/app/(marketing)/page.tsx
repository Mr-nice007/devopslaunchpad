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
import {
  FlaskConical,
  GitBranch,
  Layers,
  Route,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { HomeHeroCtas } from "@/components/landing/home-hero-ctas";

export const metadata: Metadata = {
  title: "DevOps Launchpad — Practical DevOps Training for Beginners",
  description:
    "Build real skills with guided labs in Git, Docker, Kubernetes, Terraform, Ansible, CI/CD, and cloud. Launch your DevOps career with hands-on training.",
  openGraph: {
    title: "DevOps Launchpad — Practical DevOps Training for Beginners",
    description:
      "Build real skills with guided labs in Git, Docker, Kubernetes, Terraform, Ansible, CI/CD, and cloud.",
    type: "website",
  },
};

const valueProps = [
  {
    title: "Hands-on labs",
    description: "Practice in real environments, not just theory.",
    icon: FlaskConical,
  },
  {
    title: "Real-world Projects",
    description: "Apply Git, Docker, Kubernetes, Terraform, and CI/CD in project-based labs.",
    icon: GitBranch,
  },
  {
    title: "Structured path",
    description: "From basics to deployment in a clear, step-by-step curriculum.",
    icon: Route,
  },
  {
    title: "Track progress",
    description: "See what you’ve completed and what’s next.",
    icon: Layers,
  },
];

const modules = [
  { name: "Git", lessons: 5, previewLessons: [1] },
  { name: "Docker", lessons: 5, previewLessons: [1, 2] },
  { name: "Kubernetes", lessons: 6, previewLessons: [1] },
  { name: "Terraform", lessons: 5, previewLessons: [1] },
  { name: "Ansible", lessons: 5, previewLessons: [1] },
  { name: "CI/CD", lessons: 6, previewLessons: [1] },
  { name: "Cloud Basics", lessons: 4, previewLessons: [1] },
];

const howItWorksSteps = [
  "Sign up and start the free preview.",
  "Complete guided labs at your own pace.",
  "Unlock the full course when you’re ready.",
  "Get lifetime access to updates and support.",
  "Apply your skills in real projects.",
];

const faqs = [
  {
    q: "What’s included in the free preview?",
    a: "You get access to selected lessons across modules (Git, Docker, Kubernetes, Terraform, Ansible, CI/CD, Cloud Basics) so you can try the format and content before buying.",
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
            Learn Git, Docker, Kubernetes, Ansible, CI/CD, Terraform, and cloud with guided, real-world exercises.
          </p>
          <HomeHeroCtas />
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Why DevOps Launchpad?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map(({ title, description, icon: Icon }) => (
              <Card key={title} className="border-0 bg-card/80 shadow-sm">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Course Overview */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Course overview
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Modules: Git, Docker, Kubernetes, Terraform, Ansible, CI/CD, Cloud Basics. Select lessons are free to preview.
          </p>
          <div className="space-y-4">
            {modules.map((mod) => (
              <Card key={mod.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      {mod.name}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {mod.lessons} lessons
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: mod.lessons }, (_, i) => i + 1).map(
                      (n) => (
                        <span
                          key={n}
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            mod.previewLessons.includes(n)
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          Lesson {n}
                          {mod.previewLessons.includes(n) && " (Free preview)"}
                        </span>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials placeholder */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">What learners say</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Testimonials will be added here as students complete the course.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-background">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How it works
          </h2>
          <ol className="space-y-6">
            {howItWorksSteps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {i + 1}
                </span>
                <span className="text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-muted/20">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-muted-foreground mb-8">
            Unlock the full course and get lifetime access to all modules and updates.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View pricing
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
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
